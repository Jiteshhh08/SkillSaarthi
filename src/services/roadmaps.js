import api from './api'

export async function createRoadmap(careerId, title) {
  const { data } = await api.post('/api/roadmaps', { career_id: careerId, title })
  return data?.data || null
}

export async function getRoadmaps() {
  const { data } = await api.get('/api/roadmaps')
  return data?.data?.roadmaps || []
}

export async function getRoadmap(id) {
  const { data } = await api.get(`/api/roadmaps/${id}`)
  return data?.data || null
}

export async function updateRoadmap(id, payload) {
  const { data } = await api.put(`/api/roadmaps/${id}`, payload)
  return data?.data || null
}

export async function deleteRoadmap(id) {
  const { data } = await api.delete(`/api/roadmaps/${id}`)
  return data?.data || null
}

export async function addRoadmapTask(roadmapId, payload) {
  const { data } = await api.post(`/api/roadmaps/${roadmapId}/tasks`, payload)
  return data?.data || null
}

export async function updateRoadmapTask(roadmapId, taskId, payload) {
  const { data } = await api.put(`/api/roadmaps/${roadmapId}/tasks/${taskId}`, payload)
  return data?.data || null
}

export async function reorderRoadmapTasks(roadmapId, order) {
  const { data } = await api.put(`/api/roadmaps/${roadmapId}/tasks`, { order })
  return data?.data || null
}

export async function deleteRoadmapTask(roadmapId, taskId) {
  const { data } = await api.delete(`/api/roadmaps/${roadmapId}/tasks/${taskId}`)
  return data?.data || null
}
