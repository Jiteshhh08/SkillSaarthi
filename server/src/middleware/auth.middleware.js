import { Account, Client } from 'node-appwrite'
import { config } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const requireAuth = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : ''

  if (!token) {
    throw new ApiError(401, 'Authentication required', 'UNAUTHENTICATED')
  }

  try {
    const client = new Client()
      .setEndpoint(config.appwrite.endpoint)
      .setProject(config.appwrite.projectId)
      .setJWT(token)
    const account = new Account(client)
    req.user = await account.get()
    req.jwt = token
    next()
  } catch {
    throw new ApiError(401, 'Invalid or expired authentication token', 'INVALID_TOKEN')
  }
})