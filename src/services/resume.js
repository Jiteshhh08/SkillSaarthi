import api from './api'
import { ID, RESUME_BUCKET_ID, storage } from './appwrite'

export async function uploadResume(file) {
  return storage.createFile(RESUME_BUCKET_ID, ID.unique(), file)
}

export async function analyzeResume(file, options = {}) {
  let fileId = options.fileId
  let fileName = options.fileName || file?.name || ''

  if (file && !fileId) {
    const uploaded = await uploadResume(file)
    fileId = uploaded.$id
  }

  const { data } = await api.post('/api/resume/analyze', {
    file_id: fileId,
    file_name: fileName,
    apply_skills: options.applySkills === true,
  })
  return { ...data.data, file_id: fileId }
}

export async function getResumeAnalysis(id) {
  const { data } = await api.get(`/api/resume/analysis/${id}`)
  return data.data
}

export function errorMessage(err) {
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.message) return `Upload/connect error: ${err.message}`
  return 'Could not analyze that resume. Check the file and try again.'
}
