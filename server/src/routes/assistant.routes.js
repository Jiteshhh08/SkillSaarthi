import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { config } from '../config/environment.js'
import { chatWithAssistant, getCachedProfile } from '../services/assistant.service.js'

const router = Router()
router.use(requireAuth)

function parseChatBody(req) {
  const message = String(req.body?.message || '').trim()
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : []
  if (!message) throw new ApiError(400, 'Message is required', 'INVALID_MESSAGE')
  if (message.length > 4000) throw new ApiError(400, 'Message too long', 'MESSAGE_TOO_LONG')
  return { message, history }
}

router.post('/chat', asyncHandler(async (req, res) => {
  const { message, history } = parseChatBody(req)
  const data = await chatWithAssistant(req.user.$id, { message, history })
  res.json({ success: true, data })
}))

// SSE proxy: frontend POSTs once, receives tokens progressively instead of waiting for full reply.
router.post('/chat/stream', asyncHandler(async (req, res) => {
  const { message, history } = parseChatBody(req)
  const profile = await getCachedProfile(req.user.$id)
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 120000)
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  try {
    const upstream = await fetch(`${config.aiServiceUrl}/ai/assistant/chat/stream`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, profile, history }),
      signal: controller.signal,
    })
    if (!upstream.ok || !upstream.body) {
      res.write(`data: ${JSON.stringify({ error: `Assistant returned ${upstream.status}` })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
      return
    }
    for await (const chunk of upstream.body) {
      res.write(chunk)
    }
    res.end()
  } catch {
    try {
      res.write(`data: ${JSON.stringify({ error: 'AI assistant unavailable. Try again shortly.' })}\n\n`)
      res.write('data: [DONE]\n\n')
      res.end()
    } catch { /* client already gone */ }
  } finally { clearTimeout(t) }
}))

export default router
