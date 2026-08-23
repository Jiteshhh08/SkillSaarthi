import express from 'express'
import { users, COLLECTIONS, databases, Query } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { requireAuth } from '../middleware/auth.middleware.js'
import { rateLimit } from '../middleware/rateLimit.middleware.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { isEmailConfigured, sendOtpEmail, sendPasswordResetEmail, sendPasswordResetOtpEmail, sendVerificationEmail } from '../services/email.service.js'
import {
  createPasswordResetOtp,
  consumePasswordResetOtp,
  createVerificationToken,
  consumePasswordResetToken,
  findUserByEmail,
  getVerificationStatus,
  markEmailVerified,
  verifyPasswordResetOtp,
  verifyPasswordResetToken,
  verifyVerificationToken,
} from '../services/authToken.service.js'
import {
  createPendingRegistration,
  resendPendingOtp,
  verifyPendingOtp,
} from '../services/pendingRegistration.service.js'

const router = express.Router()

// --- Helpers ---
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim())
}

function isStrongPassword(password) {
  return typeof password === 'string' && password.length >= 8
}

// Rate limiters
const resendLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 3,
  keyGenerator: (req) => `resend:${req.ip}:${req.user?.$id || req.body?.email || ''}`,
  message: 'Too many resend attempts. Please wait a minute and try again.',
})

const forgotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => `forgot:${req.ip}:${String(req.body?.email || '').toLowerCase()}`,
  message: 'Too many password reset attempts. Please try again later.',
})

const verifyLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  keyGenerator: (req) => `verify:${req.ip}`,
  message: 'Too many verification attempts. Please try again later.',
})

const signupLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  keyGenerator: (req) => `signup:${req.ip}:${String(req.body?.email || '').toLowerCase()}`,
  message: 'Too many signup attempts. Please try again later.',
})

// ============================================================
// NEW FLOW: Pending registration (OTP before Appwrite user creation)
// ============================================================

// POST /api/auth/signup  — create pending OTP, do NOT create Appwrite user yet
router.post(
  '/signup',
  signupLimiter,
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {}
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      throw new ApiError(400, 'Name is required (at least 2 characters).', 'INVALID_NAME')
    }
    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.', 'INVALID_EMAIL')
    }
    if (!isStrongPassword(password)) {
      throw new ApiError(400, 'Password must be at least 8 characters.', 'WEAK_PASSWORD')
    }
    const normalizedEmail = String(email).trim().toLowerCase()

    // Check if Appwrite user already exists
    const existingUser = await findUserByEmail(normalizedEmail)
    if (existingUser) {
      throw new ApiError(409, 'An account with this email already exists. Try logging in.', 'USER_EXISTS')
    }

    const { otp, expiresAt } = await createPendingRegistration({
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
    })

    try {
      await sendOtpEmail({ to: normalizedEmail, name: String(name).trim(), otp })
    } catch (err) {
      console.error('[auth] sendOtpEmail failed:', err.message)
    }

    const response = {
      success: true,
      message: 'Verification code sent to your email. Please verify to complete registration.',
      expires_at: expiresAt,
      email_configured: isEmailConfigured(),
    }
    // In dev/mock mode, expose OTP to allow testing without real SMTP
    if (!isEmailConfigured()) {
      response._dev_otp = otp
      response._dev_note = 'Email not configured — OTP exposed for dev only'
    }
    res.json(response)
  }),
)

// POST /api/auth/verify-otp  — verify OTP and create Appwrite user
router.post(
  '/verify-otp',
  verifyLimiter,
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body || {}
    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.', 'INVALID_EMAIL')
    }
    if (!otp || String(otp).trim().length < 4) {
      throw new ApiError(400, 'A valid OTP is required.', 'INVALID_OTP')
    }
    const result = await verifyPendingOtp({ email: String(email).trim(), otp: String(otp).trim() })
    if (!result.valid) {
      const messages = {
        missing_params: 'Email and OTP are required.',
        lookup_failed: 'Unable to verify at this time.',
        not_found: 'No pending registration found for this email. Please sign up again.',
        invalid_otp: 'Invalid verification code. Please check and try again.',
        expired: 'Verification code has expired. Please request a new one.',
        too_many_attempts: 'Too many failed attempts. Please request a new code.',
        decrypt_failed: 'Verification failed due to server error.',
        already_exists: 'An account with this email already exists.',
      }
      const status = result.reason === 'expired' || result.reason === 'too_many_attempts' ? 410 : 400
      throw new ApiError(status, messages[result.reason] || 'Verification failed.', 'OTP_FAILED')
    }
    res.json({
      success: true,
      message: 'Email verified successfully. Account created. You can now log in.',
      userId: result.user.$id,
    })
  }),
)

// POST /api/auth/resend-otp  — resend OTP for pending registration
router.post(
  '/resend-otp',
  resendLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body || {}
    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.', 'INVALID_EMAIL')
    }
    const result = await resendPendingOtp(String(email).trim())
    if (result.alreadyExists) {
      return res.json({ success: true, message: 'Account already exists. Please log in.', already_exists: true })
    }
    if (result.notFound) {
      throw new ApiError(404, 'No pending registration found. Please sign up again.', 'NOT_FOUND')
    }
    if (result.cooldown) {
      throw new ApiError(429, `Please wait ${result.waitSec}s before requesting another code.`, 'COOLDOWN')
    }
    if (result.decryptFailed) {
      throw new ApiError(500, 'Unable to resend code. Please sign up again.', 'RESEND_FAILED')
    }
    // result has otp
    try {
      const pendingName = result.doc.name || ''
      await sendOtpEmail({ to: String(email).trim().toLowerCase(), name: pendingName, otp: result.otp })
    } catch (err) {
      console.error('[auth] resend sendOtpEmail failed:', err.message)
    }
    const response = {
      success: true,
      message: 'Verification code resent. Please check your inbox.',
      expires_at: result.expiresAt,
      email_configured: isEmailConfigured(),
    }
    if (!isEmailConfigured()) {
      response._dev_otp = result.otp
    }
    res.json(response)
  }),
)

// ============================================================
// LEGACY: POST /api/auth/send-verification
// Requires auth. Sends verification email to current user.
// ============================================================
router.post(
  '/send-verification',
  requireAuth,
  resendLimiter,
  asyncHandler(async (req, res) => {
    const userId = req.user.$id
    const email = req.user.email
    const name = req.user.name || ''

    const status = await getVerificationStatus(userId)
    if (status.verified) {
      return res.json({ success: true, message: 'Email is already verified.', already_verified: true })
    }

    // Check cooldown — look for recent token
    try {
      const recent = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.emailVerificationTokens, [
        Query.equal('user_id', userId),
        Query.equal('used', false),
        Query.orderDesc('created_at'),
        Query.limit(1),
      ])
      if (recent.documents.length > 0) {
        const last = recent.documents[0]
        const age = Date.now() - new Date(last.created_at).getTime()
        if (age < config.auth.resendCooldownMs) {
          const waitSec = Math.ceil((config.auth.resendCooldownMs - age) / 1000)
          throw new ApiError(429, `Please wait ${waitSec}s before requesting another email.`, 'COOLDOWN')
        }
      }
    } catch (err) {
      if (err instanceof ApiError) throw err
      // ignore lookup errors
    }

    const { token } = await createVerificationToken(userId, email)

    try {
      await sendVerificationEmail({ to: email, name, token })
    } catch (err) {
      console.error('[auth] sendVerificationEmail failed:', err.message)
      // Don't leak — still return success, but log
    }

    res.json({
      success: true,
      message: 'Verification email sent. Please check your inbox.',
      email_configured: isEmailConfigured(),
    })
  }),
)

// ============================================================
// POST /api/auth/resend-verification (public, by email)
// Allows unauthenticated resend for users who lost their session.
// ============================================================
router.post(
  '/resend-verification',
  resendLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body || {}
    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.', 'INVALID_EMAIL')
    }

    const normalizedEmail = String(email).trim().toLowerCase()

    // Find user by email via Users API
    const user = await findUserByEmail(normalizedEmail)
    if (!user) {
      // Don't reveal existence — return generic success
      return res.json({ success: true, message: 'If an account exists, a verification email has been sent.' })
    }

    const status = await getVerificationStatus(user.$id)
    if (status.verified) {
      return res.json({ success: true, message: 'Email is already verified.', already_verified: true })
    }

    // Cooldown check
    try {
      const recent = await databases.listDocuments(config.appwrite.databaseId, COLLECTIONS.emailVerificationTokens, [
        Query.equal('user_id', user.$id),
        Query.equal('used', false),
        Query.orderDesc('created_at'),
        Query.limit(1),
      ])
      if (recent.documents.length > 0) {
        const last = recent.documents[0]
        const age = Date.now() - new Date(last.created_at).getTime()
        if (age < config.auth.resendCooldownMs) {
          const waitSec = Math.ceil((config.auth.resendCooldownMs - age) / 1000)
          throw new ApiError(429, `Please wait ${waitSec}s before requesting another email.`, 'COOLDOWN')
        }
      }
    } catch (err) {
      if (err instanceof ApiError) throw err
    }

    const { token } = await createVerificationToken(user.$id, user.email)
    try {
      await sendVerificationEmail({ to: user.email, name: user.name || '', token })
    } catch (err) {
      console.error('[auth] resendVerification failed:', err.message)
    }

    res.json({ success: true, message: 'If an account exists, a verification email has been sent.' })
  }),
)

// ============================================================
// POST /api/auth/verify-email
// Public endpoint — verifies token from email link.
// ============================================================
router.post(
  '/verify-email',
  verifyLimiter,
  asyncHandler(async (req, res) => {
    const { token } = req.body || {}
    if (!token || typeof token !== 'string' || token.trim().length < 10) {
      throw new ApiError(400, 'A valid verification token is required.', 'INVALID_TOKEN')
    }

    const result = await verifyVerificationToken(token.trim())
    if (!result.valid) {
      const messages = {
        missing_token: 'Verification token is missing.',
        invalid_token: 'Invalid verification link. It may have been corrupted or already used.',
        already_used: 'This verification link has already been used. Your email may already be verified.',
        expired: 'This verification link has expired. Please request a new one.',
        lookup_failed: 'Unable to verify email at this time. Please try again.',
      }
      throw new ApiError(400, messages[result.reason] || 'Invalid verification token.', 'VERIFICATION_FAILED')
    }

    const userId = result.doc.user_id
    await markEmailVerified(userId)

    res.json({ success: true, message: 'Email verified successfully. You can now access all features.' })
  }),
)

// ============================================================
// GET /api/auth/verification-status
// Requires auth. Returns whether current user's email is verified.
// ============================================================
router.get(
  '/verification-status',
  requireAuth,
  asyncHandler(async (req, res) => {
    const status = await getVerificationStatus(req.user.$id)
    res.json({ success: true, verified: status.verified, email: req.user.email })
  }),
)

// ============================================================
// POST /api/auth/forgot-password (public) — OTP flow
// Sends 6-digit OTP, stored as hash; generic success to avoid enumeration.
// ============================================================
router.post(
  '/forgot-password',
  forgotLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body || {}
    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.', 'INVALID_EMAIL')
    }

    const normalizedEmail = String(email).trim().toLowerCase()
    const user = await findUserByEmail(normalizedEmail)

    if (!user) {
      return res.json({
        success: true,
        message: 'If an account exists for this email, a password reset code has been sent.',
      })
    }

    const { otp, expiresAt } = await createPasswordResetOtp(user.$id, user.email)
    try {
      await sendPasswordResetOtpEmail({ to: user.email, name: user.name || '', otp })
    } catch (err) {
      console.error('[auth] sendPasswordResetOtpEmail failed:', err.message)
    }

    const response = {
      success: true,
      message: 'If an account exists for this email, a password reset code has been sent.',
      expires_at: expiresAt,
      email_configured: isEmailConfigured(),
    }
    if (!isEmailConfigured()) {
      response._dev_otp = otp
      response._dev_note = 'Email not configured — OTP exposed for dev only'
      console.log(`[auth:mock] Password reset OTP for ${user.email}: ${otp}`)
    }
    res.json(response)
  }),
)

// ============================================================
// POST /api/auth/verify-reset-otp (public)
// Body: { email, otp } — verifies OTP before allowing reset
// ============================================================
router.post(
  '/verify-reset-otp',
  verifyLimiter,
  asyncHandler(async (req, res) => {
    const { email, otp } = req.body || {}
    if (!email || !isValidEmail(email)) {
      throw new ApiError(400, 'A valid email is required.', 'INVALID_EMAIL')
    }
    if (!otp || String(otp).trim().length < 4) {
      throw new ApiError(400, 'A valid OTP is required.', 'INVALID_OTP')
    }
    const result = await verifyPasswordResetOtp(String(email).trim(), String(otp).trim())
    if (!result.valid) {
      const messages = {
        missing_params: 'Email and OTP are required.',
        invalid_otp: 'Invalid code. Please check and try again.',
        expired: 'Code has expired. Please request a new one.',
        already_used: 'This code has already been used. Please request a new one.',
        lookup_failed: 'Unable to verify at this time.',
      }
      throw new ApiError(400, messages[result.reason] || 'Invalid code.', 'OTP_FAILED')
    }
    res.json({ success: true, message: 'OTP verified. You can now reset your password.' })
  }),
)

// ============================================================
// POST /api/auth/reset-password (public)
// Body: { token, password, confirmPassword }  — legacy link
//    or { email, otp, password, confirmPassword } — OTP flow (preferred)
// ============================================================
router.post(
  '/reset-password',
  verifyLimiter,
  asyncHandler(async (req, res) => {
    const { token, email, otp, password, confirmPassword } = req.body || {}

    if (!isStrongPassword(password)) {
      throw new ApiError(400, 'Password must be at least 8 characters.', 'WEAK_PASSWORD')
    }
    if (confirmPassword !== undefined && password !== confirmPassword) {
      throw new ApiError(400, 'Passwords do not match.', 'PASSWORD_MISMATCH')
    }

    let userId

    if (email && otp) {
      // OTP flow — email must be verified via OTP
      if (!isValidEmail(email) || String(otp).trim().length < 4) {
        throw new ApiError(400, 'A valid email and OTP are required.', 'INVALID_OTP')
      }
      const result = await verifyPasswordResetOtp(String(email).trim(), String(otp).trim())
      if (!result.valid) {
        const messages = {
          missing_params: 'Email and OTP are required.',
          invalid_otp: 'Invalid code. Please check and try again.',
          expired: 'Code has expired. Please request a new one.',
          already_used: 'This code has already been used. Please request a new one.',
          lookup_failed: 'Unable to verify at this time.',
        }
        throw new ApiError(400, messages[result.reason] || 'Invalid code.', 'OTP_FAILED')
      }
      userId = result.doc.user_id
      // Consume OTP after successful verification
      await consumePasswordResetOtp(String(email).trim(), String(otp).trim())
    } else if (token && typeof token === 'string' && token.trim().length >= 10) {
      // Legacy link flow
      const result = await verifyPasswordResetToken(token.trim())
      if (!result.valid) {
        const messages = {
          missing_token: 'Reset token is missing.',
          invalid_token: 'Invalid reset link. It may have been corrupted or already used.',
          already_used: 'This reset link has already been used. Please request a new one.',
          expired: 'This reset link has expired. Please request a new one.',
          lookup_failed: 'Unable to reset password at this time. Please try again.',
        }
        throw new ApiError(400, messages[result.reason] || 'Invalid reset token.', 'RESET_FAILED')
      }
      userId = result.doc.user_id
      await consumePasswordResetToken(token.trim())
    } else {
      throw new ApiError(400, 'A valid reset token or email+OTP is required.', 'INVALID_TOKEN')
    }

    // Update password via Appwrite Users API
    try {
      await users.updatePassword(userId, password)
    } catch (err) {
      console.error('[auth] users.updatePassword failed:', err.message)
      throw new ApiError(500, 'Failed to update password. Please try again.', 'PASSWORD_UPDATE_FAILED')
    }

    res.json({ success: true, message: 'Password has been reset successfully. You can now log in.' })
  }),
)

// ============================================================
// GET /api/auth/check-reset-token?token=xxx (public)
// Utility for frontend to validate token before showing form.
// ============================================================
router.get(
  '/check-reset-token',
  asyncHandler(async (req, res) => {
    const token = req.query.token
    if (!token || typeof token !== 'string' || token.trim().length < 10) {
      throw new ApiError(400, 'A valid token is required.', 'INVALID_TOKEN')
    }
    const result = await verifyPasswordResetToken(token.trim())
    if (!result.valid) {
      throw new ApiError(400, 'Invalid or expired reset link.', 'INVALID_TOKEN')
    }
    res.json({ success: true, valid: true })
  }),
)

export default router
