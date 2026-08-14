import api from './api'

export async function getAdminStatus() {
  const { data } = await api.get('/api/admin/me')
  return data.data
}

export async function getAdminInternships(params = {}) {
  const { data } = await api.get('/api/admin/internships', { params })
  return data.data
}

export async function createInternship(payload) {
  const { data } = await api.post('/api/admin/internships', payload)
  return data.data
}

export async function updateInternship(id, payload) {
  const { data } = await api.patch(`/api/admin/internships/${id}`, payload)
  return data.data
}

export async function deleteInternship(id) {
  const { data } = await api.delete(`/api/admin/internships/${id}`)
  return data.data
}