import dotenv from 'dotenv'

dotenv.config()

export const config = {
  port: Number(process.env.PORT) || 5000,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  appwrite: {
    endpoint: process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1',
    projectId: process.env.APPWRITE_PROJECT_ID,
    apiKey: process.env.APPWRITE_API_KEY,
    databaseId: process.env.APPWRITE_DATABASE_ID,
    resumeBucketId: process.env.APPWRITE_RESUME_BUCKET_ID || 'resumes',
    adminEmails: (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  },
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  githubToken: process.env.GITHUB_TOKEN || '',
  llmApiKey: process.env.LLM_API_KEY || '',
  email: {
    host: process.env.EMAIL_HOST || '',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: String(process.env.EMAIL_SECURE || '').toLowerCase() === 'true',
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@skillsaarthi.vercel.app',
  },
  auth: {
    verificationTokenExpiryMs: Number(process.env.VERIFICATION_TOKEN_EXPIRY_MS) || 24 * 60 * 60 * 1000,
    resetTokenExpiryMs: Number(process.env.RESET_TOKEN_EXPIRY_MS) || 60 * 60 * 1000,
    resendCooldownMs: Number(process.env.RESEND_COOLDOWN_MS) || 60 * 1000,
    pendingExpiryMs: Number(process.env.PENDING_EXPIRY_MS) || 10 * 60 * 1000,
    otpLength: Number(process.env.OTP_LENGTH) || 6,
    maxOtpAttempts: Number(process.env.MAX_OTP_ATTEMPTS) || 5,
  },
}
