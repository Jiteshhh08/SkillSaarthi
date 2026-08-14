import api from './api'

export async function analyzeGitHub(username, options = {}) {
  const { data } = await api.post('/api/github/analyze', {
    username,
    apply_skills: options.applySkills === true,
  })
  return data.data
}

export async function getGitHubAnalysis(id) {
  const { data } = await api.get(`/api/github/analysis/${id}`)
  return data.data
}
