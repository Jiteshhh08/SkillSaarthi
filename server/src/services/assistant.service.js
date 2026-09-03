import { config } from '../config/environment.js'
import { buildUserProfile } from './profile.builder.js'
import { ApiError } from '../utils/ApiError.js'

export async function chatWithAssistant(userId, { message, history }) {
  const profile = await buildUserProfile(userId).catch(() => ({
    education_level: null, skills: [], interests: [], goals: [], assessment_score: null, experience_years: 0,
  }))
  const controller = new AbortController()
  const t = setTimeout(() => controller.abort(), 120000)
  try {
    const res = await fetch(`${config.aiServiceUrl}/ai/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, profile, history: history || [] }),
      signal: controller.signal,
    })
    let body = null
    try { body = await res.json() } catch { body = null }
    if (!res.ok) throw new ApiError(res.status, body?.message || body?.detail || `Assistant returned ${res.status}`, body?.code || 'ASSISTANT_ERROR')
    return { reply: body.reply, model: body.model }
  } catch (err) {
    if (err instanceof ApiError) throw err
    if (err?.name === 'AbortError') throw new ApiError(504, 'AI assistant timed out. Try again.', 'ASSISTANT_TIMEOUT')
    throw new ApiError(503, 'AI assistant unavailable. Try again shortly.', 'ASSISTANT_UNAVAILABLE')
  } finally { clearTimeout(t) }
}
