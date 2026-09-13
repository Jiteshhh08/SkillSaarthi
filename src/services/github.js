import api from './api'

export async function analyzeGitHub(username, options = {}) {
  const { data } = await api.post('/api/github/analyze', {
    username,
    apply_skills: options.applySkills === true,
  })
  return data.data
}

export async function getMyGitHubAnalysis() {
  const { data } = await api.get('/api/github/analysis')
  return data.data
}
