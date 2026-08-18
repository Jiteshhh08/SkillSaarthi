import api from './api'
import { ID, RESUME_BUCKET_ID, storage } from './appwrite'

export async function uploadResume(file) {
  return storage.createFile(RESUME_BUCKET_ID, ID.unique(), file)
}

export async function extractResume(file, options = {}) {
  let fileId = options.fileId
  let fileName = options.fileName || file?.name || ''

  if (file && !fileId) {
    const uploaded = await uploadResume(file)
    fileId = uploaded.$id
  }

  const { data } = await api.post('/api/resume/extract', {
    file_id: fileId,
    file_name: fileName,
    apply_skills: options.applySkills === true,
  })
  return { ...data.data, file_id: fileId }
}

export async function analyzeResumePipeline(analysisId, jobDescription = '', resumeJson = null) {
  const { data } = await api.post('/api/resume/analyze', {
    analysis_id: analysisId,
    job_description: jobDescription,
    resume_json: resumeJson,
  })
  return data.data
}

export async function matchResume(analysisId, jobDescription = '', resumeJson = null) {
  const { data } = await api.post('/api/resume/match', {
    analysis_id: analysisId,
    job_description: jobDescription,
    resume_json: resumeJson,
  })
  return data.data
}

export async function optimizeResume(analysisId, jobDescription = '', resumeJson = null) {
  const { data } = await api.post('/api/resume/optimize', {
    analysis_id: analysisId,
    job_description: jobDescription,
    resume_json: resumeJson,
  })
  return data.data
}

export async function generateResume(analysisId, resumeJson = null, compilePdf = true) {
  const { data } = await api.post('/api/resume/generate', {
    analysis_id: analysisId,
    resume_json: resumeJson,
    compile_pdf: compilePdf,
  })
  return data.data
}

export async function getResumeAnalysis(id) {
  const { data } = await api.get(`/api/resume/analysis/${id}`)
  return data.data
}

export async function downloadLatex(id, fileName = 'resume.tex') {
  const { data } = await api.get(`/api/resume/analysis/${id}/tex`, { responseType: 'text' })
  const blob = new Blob([data], { type: 'text/plain;charset=utf-8' })
  saveBlob(blob, fileName)
}

export async function downloadPdf(id, fileName = 'resume.pdf') {
  const { data } = await api.get(`/api/resume/analysis/${id}/pdf`, { responseType: 'blob' })
  saveBlob(data, fileName)
}

function saveBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = fileName
  link.click()
  URL.revokeObjectURL(url)
}

// Legacy helper kept for backward compatibility.
export async function analyzeResume(file, options = {}) {
  let fileId = options.fileId
  let fileName = options.fileName || file?.name || ''

  if (file && !fileId) {
    const uploaded = await uploadResume(file)
    fileId = uploaded.$id
  }

  const { data } = await api.post('/api/resume/analyze-legacy', {
    file_id: fileId,
    file_name: fileName,
    apply_skills: options.applySkills === true,
  })
  return { ...data.data, file_id: fileId }
}

export function errorMessage(err) {
  if (err?.response?.data?.message) return err.response.data.message
  if (err?.message) return `Upload/connect error: ${err.message}`
  return 'Could not analyze that resume. Check the file and try again.'
}