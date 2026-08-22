import crypto from 'node:crypto'

export function generateSecureToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString('hex')
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function isExpired(expiresAt) {
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() < Date.now()
}

export function expiryDate(msFromNow) {
  return new Date(Date.now() + msFromNow).toISOString()
}
