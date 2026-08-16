import api from './api'

export async function simulateWhatIf(changes, topN = 8) {
  const { data } = await api.post('/api/what-if/simulate', { changes: { skills: changes }, top_n: topN })
  return data?.data || null
}