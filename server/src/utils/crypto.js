import crypto from 'node:crypto'
import { config } from '../config/environment.js'

// Derive a 32-byte key from API key + projectId (deterministic per deployment)
// In production set PENDING_ENCRYPTION_KEY env to a random 32-byte hex string for stronger isolation.
function getKey() {
  const raw = process.env.PENDING_ENCRYPTION_KEY || `${config.appwrite.apiKey || 'fallback-key'}:${config.appwrite.projectId || 'proj'}`
  return crypto.createHash('sha256').update(raw).digest() // 32 bytes
}

export function encryptText(plain) {
  const key = getKey()
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  // store as base64: iv:tag:ciphertext
  return `${iv.toString('base64')}:${tag.toString('base64')}:${enc.toString('base64')}`
}

export function decryptText(payload) {
  const key = getKey()
  const [ivB64, tagB64, dataB64] = String(payload).split(':')
  if (!ivB64 || !tagB64 || !dataB64) throw new Error('Invalid encrypted payload')
  const iv = Buffer.from(ivB64, 'base64')
  const tag = Buffer.from(tagB64, 'base64')
  const data = Buffer.from(dataB64, 'base64')
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv)
  decipher.setAuthTag(tag)
  const dec = Buffer.concat([decipher.update(data), decipher.final()])
  return dec.toString('utf8')
}

export function generateOtp(length = 6) {
  const max = 10 ** length
  const min = 10 ** (length - 1)
  // secure random in range
  const n = crypto.randomInt(min, max)
  return String(n)
}

export function hashOtp(otp) {
  return crypto.createHash('sha256').update(String(otp).trim()).digest('hex')
}
