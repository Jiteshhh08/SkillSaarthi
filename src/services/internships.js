import api from './api'

export async function getRecommendedInternships() {
  const { data } = await api.get('/api/internships/recommended')
  return data.data
}

export async function getInternships(params = {}) {
  const { data } = await api.get('/api/internships', { params })
  return data.data
}
