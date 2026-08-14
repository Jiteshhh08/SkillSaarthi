import { config } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'

const AI_TIMEOUT_MS = 15000

async function post(path, payload) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  try {
    const response = await fetch(`${config.aiServiceUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!response.ok) {
      const body = await response.json().catch(() => ({}))
      throw new ApiError(response.status, body.detail || 'AI service error', 'AI_SERVICE_ERROR')
    }
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(
      503,
      'Recommendations are temporarily unavailable.',
      'AI_SERVICE_UNAVAILABLE',
    )
  } finally {
    clearTimeout(timer)
  }
}

async function get(path) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  try {
    const response = await fetch(`${config.aiServiceUrl}${path}`, { signal: controller.signal })
    if (!response.ok) {
      throw new ApiError(response.status, 'AI service error', 'AI_SERVICE_ERROR')
    }
    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(503, 'AI service is temporarily unavailable.', 'AI_SERVICE_UNAVAILABLE')
  } finally {
    clearTimeout(timer)
  }
}

export function recommendCareers(payload) {
  return post('/ai/recommend-careers', payload)
}

export function skillGaps(payload) {
  return post('/ai/skill-gaps', payload)
}

export function getCareers() {
  return get('/ai/careers')
}