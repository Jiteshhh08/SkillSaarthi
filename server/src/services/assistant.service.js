import { config } from '../config/environment.js'
import { buildUserProfile } from './profile.builder.js'
import { ApiError } from '../utils/ApiError.js'

const profileCache = new Map() // userId -> { profile, exp }
const PROFILE_TTL_MS = 60 * 1000

export async function getCachedProfile(userId) {
  const now = Date.now()
  const hit = profileCache.get(userId)
  if (hit && hit.exp > now) return hit.profile
  const fresh = await buildUserProfile(userId).catch(() => ({
    education_level: null, skills: [], interests: [], goals: [], assessment_score: null, experience_years: 0,
  }))
  profileCache.set(userId, { profile: fresh, exp: now + PROFILE_TTL_MS })
  return fresh
}

export async function chatWithAssistant(userId, { message, history }) {
  const profile = await getCachedProfile(userId)
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
