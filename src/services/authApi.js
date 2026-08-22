import api from './api'

// Legacy verification (for already-created Appwrite users)
export async function sendVerificationEmail() {
  const { data } = await api.post('/api/auth/send-verification')
  return data
}

export async function resendVerificationEmail(email) {
  const { data } = await api.post('/api/auth/resend-verification', { email })
  return data
}

export async function verifyEmail(token) {
  const { data } = await api.post('/api/auth/verify-email', { token })
  return data
}

export async function getVerificationStatus() {
  const { data } = await api.get('/api/auth/verification-status')
  return data
}

// New pending-OTP flow (signup before Appwrite user creation)
export async function signupPending({ name, email, password }) {
  const { data } = await api.post('/api/auth/signup', { name, email, password })
  return data
}

export async function verifyOtp({ email, otp }) {
  const { data } = await api.post('/api/auth/verify-otp', { email, otp })
  return data
}

export async function resendOtp(email) {
  const { data } = await api.post('/api/auth/resend-otp', { email })
  return data
}

export async function forgotPassword(email) {
  const { data } = await api.post('/api/auth/forgot-password', { email })
  return data
}

export async function resetPassword({ token, password, confirmPassword }) {
  const { data } = await api.post('/api/auth/reset-password', { token, password, confirmPassword })
  return data
}

export async function checkResetToken(token) {
  const { data } = await api.get('/api/auth/check-reset-token', { params: { token } })
  return data
}
