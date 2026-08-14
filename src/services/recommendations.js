import api from './api'

export async function generateRecommendations(topN = 6) {
  const { data } = await api.post('/api/recommendations/generate', { top_n: topN })
  return data?.data?.recommendations || []
}

export async function getRecommendations() {
  const { data } = await api.get('/api/recommendations')
  return data?.data?.recommendations || []
}

export async function getRecommendation(id) {
  const { data } = await api.get(`/api/recommendations/${id}`)
  return data?.data?.recommendation || null
}