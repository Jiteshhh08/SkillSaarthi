import { databases, users, COLLECTIONS, ID, Query } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { expiryDate, isExpired } from '../utils/token.js'
import { encryptText, decryptText, generateOtp, hashOtp } from '../utils/crypto.js'

const DB = () => config.appwrite.databaseId

async function invalidateExistingPendings(email) {
  try {
    const existing = await databases.listDocuments(DB(), COLLECTIONS.pendingRegistrations, [
      Query.equal('email', email.toLowerCase()),
      Query.equal('used', false),
      Query.limit(100),
    ])
    for (const doc of existing.documents) {
      try {
        await databases.updateDocument(DB(), COLLECTIONS.pendingRegistrations, doc.$id, { used: true })
      } catch {}
    }
  } catch {}
}

export async function createPendingRegistration({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase()
  await invalidateExistingPendings(normalizedEmail)

  const otp = generateOtp(config.auth.otpLength)
  const otpHash = hashOtp(otp)
  const expiresAt = expiryDate(config.auth.pendingExpiryMs)
  const encryptedPassword = encryptText(password)

  let doc
  try {
    doc = await databases.createDocument(DB(), COLLECTIONS.pendingRegistrations, ID.unique(), {
      email: normalizedEmail,
      name: name.trim(),
      password_enc: encryptedPassword,
      otp_hash: otpHash,
      expires_at: expiresAt,
      used: false,
      attempts: 0,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    if (err.message?.includes('Collection with the requested ID could not be found')) {
      throw new Error('Pending registrations collection not found. Run: npm run setup:appwrite to create missing collections.')
    }
    throw err
  }
  return { doc, otp, expiresAt }
}

export async function verifyPendingOtp({ email, otp }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const cleanOtp = String(otp || '').trim()
  if (!normalizedEmail || !cleanOtp) return { valid: false, reason: 'missing_params' }

  const otpHash = hashOtp(cleanOtp)

  let docs
  try {
    const res = await databases.listDocuments(DB(), COLLECTIONS.pendingRegistrations, [
      Query.equal('email', normalizedEmail),
      Query.equal('used', false),
      Query.orderDesc('created_at'),
      Query.limit(10),
    ])
    docs = res.documents
  } catch {
    return { valid: false, reason: 'lookup_failed' }
  }

  if (!docs || docs.length === 0) return { valid: false, reason: 'not_found' }

  // Find matching hash; also handle expiry and attempts
  let matched = null
  for (const d of docs) {
    if (d.otp_hash === otpHash) {
      matched = d
      break
    }
  }

  if (!matched) {
    // increment attempts on latest
    const latest = docs[0]
    try {
      const attempts = (latest.attempts || 0) + 1
      await databases.updateDocument(DB(), COLLECTIONS.pendingRegistrations, latest.$id, { attempts })
      if (attempts >= config.auth.maxOtpAttempts) {
        await databases.updateDocument(DB(), COLLECTIONS.pendingRegistrations, latest.$id, { used: true })
      }
    } catch {}
    return { valid: false, reason: 'invalid_otp' }
  }

  if (isExpired(matched.expires_at)) return { valid: false, reason: 'expired' }
  if (matched.attempts >= config.auth.maxOtpAttempts) return { valid: false, reason: 'too_many_attempts' }

  // Decrypt password
  let password
  try {
    password = decryptText(matched.password_enc)
  } catch {
    return { valid: false, reason: 'decrypt_failed' }
  }

  // Mark used first to prevent race
  try {
    await databases.updateDocument(DB(), COLLECTIONS.pendingRegistrations, matched.$id, { used: true })
  } catch {}

  // Create Appwrite user
  let appwriteUser
  try {
    appwriteUser = await users.create(ID.unique(), matched.email, undefined, password, matched.name)
    // users.create signature in node-appwrite v27: create(userId, email, phone, password, name)
    // Some older versions: create(userId, email, password, name) — handle both by checking if appwriteUser exists
    if (!appwriteUser || !appwriteUser.$id) {
      // try alternative signature if failed silently
      throw new Error('User creation returned empty')
    }
  } catch (err) {
    // If signature mismatch, try alternative order (email, password, name)
    if (err.message?.includes('Invalid phone') || err.message?.includes('phone')) {
      try {
        appwriteUser = await users.create(ID.unique(), matched.email, password, matched.name)
      } catch (e2) {
        throw new Error(`Failed to create Appwrite user: ${e2.message}`)
      }
    } else if (err.message?.toLowerCase().includes('already exists') || err.code === 409) {
      return { valid: false, reason: 'already_exists', message: err.message }
    } else {
      // attempt second signature
      if (!appwriteUser) {
        try {
          // Try calling with 4 args as fallback
          appwriteUser = await users.create(ID.unique(), matched.email, password, matched.name)
        } catch (e3) {
          throw new Error(`Failed to create Appwrite user: ${err.message} / ${e3.message}`)
        }
      } else {
        throw new Error(`Failed to create Appwrite user: ${err.message}`)
      }
    }
  }

  // Also try to set email verification true
  try {
    await users.updateEmailVerification(appwriteUser.$id, true)
  } catch {}

  // Create profile document marked verified
  try {
    await databases.createDocument(DB(), COLLECTIONS.profiles, appwriteUser.$id, {
      user_id: appwriteUser.$id,
      is_email_verified: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  } catch (err) {
    // if profile already exists (race), update it
    try {
      await databases.updateDocument(DB(), COLLECTIONS.profiles, appwriteUser.$id, {
        is_email_verified: true,
        updated_at: new Date().toISOString(),
      })
    } catch {}
  }

  // Invalidate any other pendings for this email
  await invalidateExistingPendings(normalizedEmail)

  return { valid: true, user: appwriteUser, doc: matched }
}

export async function getPendingByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase()
  try {
    const res = await databases.listDocuments(DB(), COLLECTIONS.pendingRegistrations, [
      Query.equal('email', normalized),
      Query.equal('used', false),
      Query.orderDesc('created_at'),
      Query.limit(1),
    ])
    return res.documents[0] || null
  } catch {
    return null
  }
}

export async function resendPendingOtp(email) {
  const normalized = String(email || '').trim().toLowerCase()
  // Check if user already exists — don't allow resend if already registered
  try {
    const list = await users.list([Query.equal('email', normalized), Query.limit(1)])
    if (list.users && list.users.length > 0) {
      return { alreadyExists: true }
    }
  } catch {}

  const existing = await getPendingByEmail(normalized)
  if (!existing) return { notFound: true }

  // Cooldown check
  const age = Date.now() - new Date(existing.created_at).getTime()
  if (age < config.auth.resendCooldownMs) {
    const waitSec = Math.ceil((config.auth.resendCooldownMs - age) / 1000)
    return { cooldown: true, waitSec }
  }

  // Need plaintext password to re-encrypt with new OTP — decrypt existing
  let password
  try {
    password = decryptText(existing.password_enc)
  } catch {
    return { decryptFailed: true }
  }

  // Invalidate old
  await invalidateExistingPendings(normalized)

  // Create new pending with same name/password but new OTP
  const otp = generateOtp(config.auth.otpLength)
  const otpHash = hashOtp(otp)
  const expiresAt = expiryDate(config.auth.pendingExpiryMs)
  const encryptedPassword = encryptText(password)

  let doc
  try {
    doc = await databases.createDocument(DB(), COLLECTIONS.pendingRegistrations, ID.unique(), {
      email: normalized,
      name: existing.name,
      password_enc: encryptedPassword,
      otp_hash: otpHash,
      expires_at: expiresAt,
      used: false,
      attempts: 0,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    throw err
  }

  return { doc, otp, expiresAt }
}
