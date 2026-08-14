import api from './api'

export async function getCareers() {
  const { data } = await api.get('/api/careers')
  return data?.data?.careers || []
}

export async function getCareer(careerId) {
  const { data } = await api.get(`/api/careers/${careerId}`)
  return data?.data?.career || null
}

export async function getCareerSkillGaps(careerId) {
  const { data } = await api.get(`/api/recommendations/careers/${careerId}/skill-gaps`)
  return data?.data?.gaps || null
}