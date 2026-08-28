import api from './api'

export const POST_CATEGORIES = [
  'Career Guidance',
  'Skill Building',
  'Internship',
  'Success Story',
  'Resource',
  'General',
]

export async function getPosts(params = {}) {
  const { data } = await api.get('/api/community/posts', { params })
  return data.data
}

export async function getPost(postId) {
  const { data } = await api.get(`/api/community/posts/${postId}`)
  return data.data.post
}

export async function createPost(input) {
  const { data } = await api.post('/api/community/posts', input)
  return data.data.post
}

export async function updatePost(postId, input) {
  const { data } = await api.put(`/api/community/posts/${postId}`, input)
  return data.data.post
}

export async function deletePost(postId) {
  await api.delete(`/api/community/posts/${postId}`)
}

export async function toggleLike(postId) {
  const { data } = await api.post(`/api/community/posts/${postId}/like`)
  return data.data
}

export async function toggleBookmark(postId) {
  const { data } = await api.post(`/api/community/posts/${postId}/bookmark`)
  return data.data
}

export async function getSavedPosts() {
  const { data } = await api.get('/api/community/saved')
  return data.data
}

export async function getComments(postId, params = {}) {
  const { data } = await api.get(`/api/community/posts/${postId}/comments`, { params })
  // Handle both array (legacy) and object {comments, total}
  if (Array.isArray(data.data.comments)) return data.data.comments
  if (Array.isArray(data.data)) return data.data
  return data.data.comments || []
}

export async function addComment(postId, content) {
  const { data } = await api.post(`/api/community/posts/${postId}/comments`, { content })
  return data.data.comment
}

export async function updateComment(commentId, content) {
  const { data } = await api.put(`/api/community/comments/${commentId}`, { content })
  return data.data.comment
}

export async function deleteComment(commentId) {
  await api.delete(`/api/community/comments/${commentId}`)
}

export async function getMyCommunityProfile() {
  const { data } = await api.get('/api/community/profile')
  return data.data
}

export async function updateMyCommunityProfile(input) {
  const { data } = await api.put('/api/community/profile', input)
  return data.data
}

export async function getUserProfile(userId) {
  const { data } = await api.get(`/api/community/users/${userId}`)
  return data.data
}