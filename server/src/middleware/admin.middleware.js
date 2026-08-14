import { ApiError } from '../utils/ApiError.js'
import { config } from '../config/environment.js'

export const requireAdmin = (req, _res, next) => {
  const email = String(req.user?.email || '').toLowerCase().trim()
  if (config.appwrite.adminEmails.length === 0 || !config.appwrite.adminEmails.includes(email)) {
    throw new ApiError(403, 'Admin access required', 'ADMIN_REQUIRED')
  }
  next()
}