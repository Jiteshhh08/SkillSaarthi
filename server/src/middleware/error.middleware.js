import { ApiError } from '../utils/ApiError.js'

export function notFound(req, _res, next) {
  const error = new ApiError(
    404,
    `Route not found: ${req.method} ${req.originalUrl}`,
    'NOT_FOUND',
  )
  next(error)
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_ERROR' : 'ERROR')

  if (statusCode >= 500) {
    console.error(err)
  }

  res.status(statusCode).json({
    success: false,
    message: statusCode >= 500 ? 'Internal server error' : err.message,
    code,
  })
}