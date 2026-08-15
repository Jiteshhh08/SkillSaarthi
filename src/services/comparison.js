import api from './api'

export async function compareCareers(careerIds) {
  const { data } = await api.post('/api/careers/compare', { career_ids: careerIds })
  return data?.data || null
}