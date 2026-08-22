import { databases, users, COLLECTIONS, ID, Query } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { expiryDate, generateSecureToken, hashToken, isExpired } from '../utils/token.js'

const DB = () => config.appwrite.databaseId

// ---- helpers ----
async function findByTokenHash(collectionId, tokenHash) {
  const res = await databases.listDocuments(DB(), collectionId, [
    Query.equal('token_hash', tokenHash),
    Query.limit(1),
  ])
  return res.documents[0] || null
}

async function invalidateExistingTokens(collectionId, userId) {
  try {
    const existing = await databases.listDocuments(DB(), collectionId, [
      Query.equal('user_id', userId),
      Query.equal('used', false),
      Query.limit(100),
    ])
    for (const doc of existing.documents) {
      try {
        await databases.updateDocument(DB(), collectionId, doc.$id, { used: true })
      } catch {
        // ignore
      }
    }
  } catch {
    // collection may not exist yet
  }
}

// ---- Verification Tokens ----
export async function createVerificationToken(userId, email) {
  await invalidateExistingTokens(COLLECTIONS.emailVerificationTokens, userId)

  const token = generateSecureToken(32)
  const tokenHash = hashToken(token)
  const expiresAt = expiryDate(config.auth.verificationTokenExpiryMs)

  try {
    await databases.createDocument(DB(), COLLECTIONS.emailVerificationTokens, ID.unique(), {
      user_id: userId,
      email,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    // If collection doesn't exist, throw a clear error
    if (err.message?.includes('Collection with the requested ID could not be found')) {
      throw new Error(
        'Email verification collection not found. Run: npm run setup:appwrite to create missing collections.',
      )
    }
    throw err
  }

  return { token, expiresAt }
}

export async function verifyVerificationToken(token) {
  if (!token) return { valid: false, reason: 'missing_token' }
  const tokenHash = hashToken(token)
  let doc
  try {
    doc = await findByTokenHash(COLLECTIONS.emailVerificationTokens, tokenHash)
  } catch {
    return { valid: false, reason: 'lookup_failed' }
  }
  if (!doc) return { valid: false, reason: 'invalid_token' }
  if (doc.used) return { valid: false, reason: 'already_used' }
  if (isExpired(doc.expires_at)) return { valid: false, reason: 'expired' }

  // Mark as used
  try {
    await databases.updateDocument(DB(), COLLECTIONS.emailVerificationTokens, doc.$id, { used: true })
  } catch {
    // non-critical
  }

  return { valid: true, doc }
}

export async function getVerificationStatus(userId) {
  try {
    const profile = await databases.getDocument(DB(), COLLECTIONS.profiles, userId)
    if (profile.is_email_verified === true) return { verified: true }
    if (profile.is_email_verified === false) return { verified: false }
    // Legacy profile without is_email_verified field — treat as verified
    // to avoid locking out existing users. New users will have explicit false.
    if (profile && profile.is_email_verified === undefined) return { verified: true }
    if (profile && profile.is_email_verified === null) return { verified: true }
    // No profile yet (new user before onboarding) — check Appwrite flag
    try {
      const u = await users.get(userId)
      if (u.emailVerification) return { verified: true }
    } catch {
      // ignore
    }
    // New user without profile and not verified in Appwrite -> not verified
    if (!profile) return { verified: false }
    return { verified: true }
  } catch {
    // No profile document — check Appwrite flag; new users without profile are unverified
    try {
      const u = await users.get(userId)
      if (u.emailVerification) return { verified: true }
    } catch {
      // ignore
    }
    return { verified: false }
  }
}

export async function markEmailVerified(userId) {
  // Update Appwrite user emailVerification flag
  try {
    await users.updateEmailVerification(userId, true)
  } catch (err) {
    console.warn('[auth] users.updateEmailVerification failed:', err.message)
  }
  // Update profile document if exists
  try {
    const profile = await databases.getDocument(DB(), COLLECTIONS.profiles, userId)
    if (profile) {
      await databases.updateDocument(DB(), COLLECTIONS.profiles, userId, {
        is_email_verified: true,
        updated_at: new Date().toISOString(),
      })
    }
  } catch {
    // profile may not exist yet — create minimal
    try {
      await databases.createDocument(DB(), COLLECTIONS.profiles, userId, {
        user_id: userId,
        is_email_verified: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch {
      // ignore
    }
  }
  // Invalidate remaining verification tokens
  await invalidateExistingTokens(COLLECTIONS.emailVerificationTokens, userId)
}

// ---- Password Reset Tokens ----
export async function createPasswordResetToken(userId, email) {
  await invalidateExistingTokens(COLLECTIONS.passwordResetTokens, userId)

  const token = generateSecureToken(32)
  const tokenHash = hashToken(token)
  const expiresAt = expiryDate(config.auth.resetTokenExpiryMs)

  try {
    await databases.createDocument(DB(), COLLECTIONS.passwordResetTokens, ID.unique(), {
      user_id: userId,
      email,
      token_hash: tokenHash,
      expires_at: expiresAt,
      used: false,
      created_at: new Date().toISOString(),
    })
  } catch (err) {
    if (err.message?.includes('Collection with the requested ID could not be found')) {
      throw new Error(
        'Password reset collection not found. Run: npm run setup:appwrite to create missing collections.',
      )
    }
    throw err
  }

  return { token, expiresAt }
}

export async function verifyPasswordResetToken(token) {
  if (!token) return { valid: false, reason: 'missing_token' }
  const tokenHash = hashToken(token)
  let doc
  try {
    doc = await findByTokenHash(COLLECTIONS.passwordResetTokens, tokenHash)
  } catch {
    return { valid: false, reason: 'lookup_failed' }
  }
  if (!doc) return { valid: false, reason: 'invalid_token' }
  if (doc.used) return { valid: false, reason: 'already_used' }
  if (isExpired(doc.expires_at)) return { valid: false, reason: 'expired' }

  return { valid: true, doc }
}

export async function consumePasswordResetToken(token) {
  const result = await verifyPasswordResetToken(token)
  if (!result.valid) return result
  try {
    await databases.updateDocument(DB(), COLLECTIONS.passwordResetTokens, result.doc.$id, { used: true })
  } catch {
    // ignore
  }
  return result
}

export async function findUserByEmail(email) {
  try {
    const list = await users.list([Query.equal('email', email), Query.limit(1)])
    return list.users[0] || null
  } catch {
    return null
  }
}
