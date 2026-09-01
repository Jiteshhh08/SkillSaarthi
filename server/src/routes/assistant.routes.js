import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { chatWithAssistant } from '../services/assistant.service.js'

const router = Router()
router.use(requireAuth)

router.post('/chat', asyncHandler(async (req, res) => {
  const message = String(req.body?.message || '').trim()
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : []
  if (!message) throw new ApiError(400, 'Message is required', 'INVALID_MESSAGE')
  if (message.length > 4000) throw new ApiError(400, 'Message too long', 'MESSAGE_TOO_LONG')
  const data = await chatWithAssistant(req.user.$id, { message, history })
  res.json({ success: true, data })
}))

export default router
