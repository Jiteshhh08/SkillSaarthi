import api from './api'

export async function chatAssistant(message, history = []) {
  const { data } = await api.post('/api/assistant/chat', { message, history })
  return data.data
}
