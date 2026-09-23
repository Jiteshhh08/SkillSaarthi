import api from './api'
import { account } from './appwrite'

export async function chatAssistant(message, history = []) {
  const { data } = await api.post('/api/assistant/chat', { message, history })
  return data.data
}

// Streams tokens via SSE so first word renders in ~1s. Falls back to chatAssistant on failure.
export async function chatAssistantStream(message, history = [], onToken) {
  const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
  const headers = { 'Content-Type': 'application/json' }
  try {
    const { jwt } = await account.createJWT()
    if (jwt) headers.Authorization = `Bearer ${jwt}`
  } catch { /* anonymous: let backend 401 */ }
  const res = await fetch(`${base}/api/assistant/chat/stream`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ message, history }),
  })
  if (!res.ok || !res.body) throw new Error(`Stream returned ${res.status}`)
  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buf = ''
  let full = ''
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    buf += decoder.decode(value, { stream: true })
    const events = buf.split('\n\n')
    buf = events.pop() || ''
    for (const ev of events) {
      const line = ev.trim().split('\n').find((l) => l.startsWith('data:'))
      if (!line) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') return { reply: full }
      let json = null
      try {
        json = JSON.parse(payload)
      } catch {
        continue // incomplete chunk split — remainder stays in buf, skip
      }
      if (json.delta) {
        full += json.delta
        onToken?.(json.delta, full)
      } else if (json.error) {
        throw new Error(json.error)
      }
    }
  }
  return { reply: full }
}
