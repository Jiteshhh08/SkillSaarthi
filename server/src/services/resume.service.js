import { COLLECTIONS, ID, Permission, Query, Role, databases, storage } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'
import { applyDetectedSkills } from './github.service.js'

const AI_TIMEOUT_MS = 30000
const MAX_EXTRACTED_LENGTH = 2000
const MAX_ANALYSIS_LENGTH = 6000
// Pipeline blobs are stored as JSON files in Appwrite Storage, not as
// collection columns (the collection would exceed Appwrite's row-size cap).
// These are sanity caps so a single blob file never grows unbounded.
const MAX_LATEX_LENGTH = 20000
const MAX_JOB_DESCRIPTION_LENGTH = 6000
const MAX_PIPELINE_BLOB_CHARS = 60000

// ============================================================================
// Legacy rule-based analyzer (used only by POST /api/resume/analyze-legacy and
// as an honest `source: "fallback"` when the AI service is unreachable).
// ============================================================================

// Skill lexicon for the Node fallback analyzer (mirrors ai-service/app/resume/analyzer.py).
const SKILL_SYNONYMS = {
  JavaScript: ['javascript', 'js'],
  TypeScript: ['typescript'],
  Python: ['python'],
  Java: ['java'],
  'C++': ['c++', 'cpp'],
  SQL: ['sql', 'mysql', 'postgresql', 'postgres'],
  'HTML/CSS': ['html', 'css'],
  React: ['react', 'react.js', 'reactjs'],
  'Node.js': ['node.js', 'nodejs'],
  Express: ['express', 'express.js', 'expressjs'],
  'REST APIs': ['rest api', 'rest apis', 'restful'],
  'Next.js': ['next.js', 'nextjs'],
  'Git & GitHub': ['git', 'github', 'gitlab'],
  'Data Analysis': ['data analysis', 'data analytics'],
  Statistics: ['statistics', 'statistical'],
  'Machine Learning': ['machine learning', 'ml'],
  'Deep Learning': ['deep learning', 'neural network'],
  'Data Visualization': ['data visualization', 'tableau', 'power bi', 'dashboards'],
  Pandas: ['pandas'],
  NumPy: ['numpy'],
  Docker: ['docker', 'containerization', 'containers'],
  Kubernetes: ['kubernetes', 'k8s'],
  AWS: ['aws', 'ec2', 's3', 'lambda'],
  'CI/CD': ['ci/cd', 'cicd', 'jenkins', 'github actions'],
  Linux: ['linux', 'unix', 'bash'],
  'Network Security': ['network security', 'firewall', 'intrusion detection'],
  'Penetration Testing': ['penetration testing', 'pentesting', 'ethical hacking'],
  Cryptography: ['cryptography', 'encryption'],
  'Security Compliance': ['security compliance', 'iso 27001', 'gdpr', 'owasp'],
  Communication: ['communication', 'presentation'],
  'Problem Solving': ['problem solving', 'problem-solving', 'analytical'],
  Teamwork: ['teamwork', 'collaboration'],
  'Time Management': ['time management'],
  Leadership: ['leadership', 'mentoring'],
}

const EDUCATION_KEYWORDS = [
  { keywords: ['phd'], label: 'doctorate', rank: 5 },
  { keywords: ['master'], label: 'postgraduate', rank: 4 },
  { keywords: ['b.tech', 'bachelor', 'b.e', 'b.s', 'b.a'], label: "bachelor's degree", rank: 3 },
  { keywords: ['high school', 'diploma', 'associate'], label: 'high school', rank: 2 },
]

// Mirror of the career dataset used by the fallback (subset of careers.py).
const FALLBACK_CAREERS = [
  {
    name: 'Full Stack Developer',
    skills: { javascript: 4, react: 3, 'node.js': 4, express: 4, 'rest apis': 4, sql: 3, 'git & github': 3 },
  },
  {
    name: 'Frontend Developer',
    skills: { javascript: 4, react: 4, 'html/css': 4, typescript: 3, 'next.js': 3, 'git & github': 3 },
  },
  {
    name: 'Data Analyst',
    skills: { sql: 4, python: 3, 'data analysis': 4, statistics: 4, 'data visualization': 4, pandas: 3 },
  },
  {
    name: 'Backend Developer',
    skills: { 'node.js': 4, express: 4, sql: 4, 'rest apis': 4, python: 3, docker: 3, 'git & github': 3 },
  },
]

function normalizeName(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
}

function detectSkills(text) {
  if (!text) return []
  const lowered = text.toLowerCase()
  const signals = {}
  for (const [skill, synonyms] of Object.entries(SKILL_SYNONYMS)) {
    let count = 0
    for (const syn of synonyms) {
      const pattern = new RegExp(`\\b${syn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'g')
      const match = lowered.match(pattern)
      if (match) count += match.length
    }
    if (count === 0) continue
    const confidence = Math.min(95, 55 + 15 * count)
    signals[normalizeName(skill)] = {
      skill,
      confidence,
      proficiency: confidenceToProficiency(confidence),
    }
  }
  return Object.values(signals)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 16)
}

function confidenceToProficiency(confidence) {
  if (confidence >= 90) return 5
  if (confidence >= 75) return 4
  if (confidence >= 60) return 3
  if (confidence >= 40) return 2
  return 1
}

function detectExperienceYears(text) {
  if (!text) return 0
  const explicit = text.toLowerCase().match(/(\d+)\s*\+?\s*years?\s*(of\s*)?(professional\s*)?experience/)
  if (explicit) {
    const value = Number(explicit[1])
    if (Number.isFinite(value)) return value
  }
  const years = (text.match(/\b(?:19|20)\d{2}\b/g) || [])
    .map((y) => Number(y))
    .filter((y) => y <= 2030)
    .sort((a, b) => a - b)
  if (years.length >= 2) {
    const delta = years[years.length - 1] - years[0]
    if (delta > 0 && delta < 40) return delta
  }
  return 0
}

function detectEducation(text) {
  if (!text) return 'not specified'
  const lowered = text.toLowerCase()
  let found = 'not specified'
  let foundRank = -1
  for (const entry of EDUCATION_KEYWORDS) {
    if (entry.keywords.some((k) => lowered.includes(k)) && entry.rank > foundRank) {
      found = entry.label
      foundRank = entry.rank
    }
  }
  return found
}

function detectProjects(text) {
  if (!text) return []
  const projects = []
  const verbs = ['project', 'built', 'developed', 'designed', 'engineered', 'implemented', 'created']
  for (const line of text.split(/\r?\n/)) {
    const stripped = line.trim().replace(/^[-•*]\s*/, '')
    if (stripped.length < 8 || stripped.length > 220) continue
    if (verbs.some((v) => stripped.toLowerCase().includes(v))) {
      projects.push(stripped)
      if (projects.length >= 6) break
    }
  }
  return projects
}

function fallbackCareerMatches(skills) {
  const map = {}
  for (const item of skills) map[normalizeName(item.skill)] = item.proficiency
  const matches = []
  for (const career of FALLBACK_CAREERS) {
    let total = 0
    const matched = []
    const gaps = []
    for (const [skill, required] of Object.entries(career.skills)) {
      const level = map[skill] || 0
      total += Math.min(level, required) / required
      if (level >= 3) matched.push(skill)
      else if (level === 0) gaps.push(skill)
    }
    const confidence = Math.round((total / Object.keys(career.skills).length) * 100)
    if (confidence >= 40) {
      matches.push({
        career: career.name,
        confidence,
        reasons: matched.slice(0, 4).map((s) => `Experience with ${s}`),
        skill_gaps: gaps.slice(0, 5),
      })
    }
  }
  return matches.sort((a, b) => b.confidence - a.confidence).slice(0, 4)
}

function computeFallbackAnalysis(text) {
  const skills = detectSkills(text)
  const experienceYears = detectExperienceYears(text)
  const education = detectEducation(text)
  const projects = detectProjects(text)
  const matches = fallbackCareerMatches(skills)
  const strengths = skills
    .filter((s) => s.confidence >= 70)
    .slice(0, 5)
    .map((s) => `Strong ${s.skill} skills listed on your resume`)
  const emailMatch = (text || '').match(/[\w.+-]+@[\w-]+\.[\w.]+/)
  const contact = { email: emailMatch ? emailMatch[0] : null }

  const areas = []
  if (!experienceYears) {
    areas.push('No clear work experience dates found — add dates to your roles for a stronger signal')
  }
  if (!skills.length) {
    areas.push('Add an explicit skills section so tools can detect them automatically')
  }
  if (matches[0]?.skill_gaps?.length) {
    areas.push(`To grow your ${matches[0].career} match, highlight or learn: ${matches[0].skill_gaps.slice(0, 3).join(', ')}`)
  }
  if (!areas.length) areas.push('Your resume is in good shape — keep it focused and current')

  let summary
  if (matches[0] && skills.length) {
    const primary = skills.slice(0, 3).map((s) => s.skill).join(', ')
    summary = `Your resume shows strong ${primary} experience. Best current career match: ${matches[0].career} (${matches[0].confidence}%).`
  } else if (skills.length) {
    summary = `Your resume lists ${skills.length} skills, but no strong career match yet. Filling the highlighted gaps unlocks stronger matches.`
  } else {
    summary = "We couldn't detect clear skills or experience in this resume. Make sure it contains a skills section and date ranges for each role."
  }

  return {
    summary,
    skills,
    experience_years: experienceYears,
    projects,
    education,
    contact,
    strengths,
    areas_to_improve: areas,
    career_matches: matches,
  }
}

// ============================================================================
// Shared pipeline helpers
// ============================================================================

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value
  if (value instanceof ArrayBuffer) return Buffer.from(value)
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength)
  if (value && typeof value.arrayBuffer === 'function') {
    return Buffer.from(await value.arrayBuffer())
  }
  if (value && typeof value.getReader === 'function') {
    const chunks = []
    const reader = value.getReader()
    for (;;) {
      const { done, value: chunk } = await reader.read()
      if (done) break
      chunks.push(Buffer.from(chunk))
    }
    return Buffer.concat(chunks)
  }
  if (value && typeof value === 'object' && typeof value.data !== 'undefined' && value.data !== null) {
    return toBuffer(value.data)
  }
  throw new ApiError(500, 'Could not read the resume file.', 'RESUME_FILE_READ_ERROR')
}

async function fetchFileBytes(fileId) {
  try {
    const file = await storage.getFile(config.appwrite.resumeBucketId, fileId)
    const bytes = await toBuffer(await storage.getFileDownload(config.appwrite.resumeBucketId, fileId))
    return { bytes, mimeType: file?.mimeType || '' }
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(404, 'Resume file not found. Please upload it again.', 'RESUME_FILE_NOT_FOUND')
  }
}

// ----------------------------------------------------------------------------
// Pipeline blob storage (resume_json / analysis_json / job_match_json /
// optimized_resume_json / latex_source) — a single JSON file per analysis.
// ----------------------------------------------------------------------------

async function getPipelineData(userId, analysisId) {
  const doc = await getOwnedAnalysisDoc(userId, analysisId)
  if (!doc.data_file_id) return {}
  try {
    const raw = await storage.getFileDownload(config.appwrite.resumeBucketId, doc.data_file_id)
    let parsed = null
    if (
      raw &&
      typeof raw === 'object' &&
      !Buffer.isBuffer(raw) &&
      !(raw instanceof ArrayBuffer) &&
      !ArrayBuffer.isView(raw) &&
      typeof raw.getReader !== 'function'
    ) {
      // node-appwrite returns the parsed body for application/json files.
      parsed = raw
    } else {
      const bytes = await toBuffer(raw)
      parsed = JSON.parse(bytes.toString('utf8'))
    }
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}
  } catch {
    return {}
  }
}

async function updatePipelineData(userId, analysisId, patch) {
  const doc = await getOwnedAnalysisDoc(userId, analysisId)
  const existing = doc.data_file_id ? await getPipelineData(userId, analysisId) : {}
  const next = { ...existing }
  for (const [key, value] of Object.entries(patch || {})) {
    if (value === undefined || value === null) continue
    next[key] = value
  }
  const text = JSON.stringify(next)
  if (text.length > MAX_PIPELINE_BLOB_CHARS) {
    throw new ApiError(413, 'Resume data is too large to store.', 'RESUME_DATA_TOO_LARGE')
  }
  const file = new File([Buffer.from(text, 'utf8')], `pipeline-${Date.now()}.json`, {
    type: 'application/json',
  })
  let created
  try {
    created = await storage.createFile(config.appwrite.resumeBucketId, ID.unique(), file, [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ])
  } catch {
    throw new ApiError(
      500,
      'Could not store this resume stage. Please try again.',
      'RESUME_DATA_STORE_FAILED',
    )
  }
  await databases.updateDocument(config.appwrite.databaseId, COLLECTIONS.resumeAnalyses, analysisId, {
    data_file_id: created.$id,
    updated_at: new Date().toISOString(),
  })
  if (doc.data_file_id) {
    try {
      await storage.deleteFile(config.appwrite.resumeBucketId, doc.data_file_id)
    } catch {
      // best-effort cleanup of the superseded blob
    }
  }
}

function parseStoredJson(value, fallback = null) {
  if (!value) return fallback
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

async function requestPipeline(payload, path, { timeout = AI_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)
  try {
    const response = await fetch(`${config.aiServiceUrl}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    let body = null
    try {
      body = await response.json()
    } catch {
      body = null
    }
    if (!response.ok) {
      const code = body?.code || 'AI_SERVICE_ERROR'
      const message = body?.message || `The AI service returned ${response.status}.`
      throw new ApiError(response.status, message, code)
    }
    return body
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error?.name === 'AbortError') {
      throw new ApiError(504, 'The AI service timed out. Try again in a moment.', 'AI_TIMEOUT')
    }
    throw new ApiError(503, 'The AI service is unavailable. Try again shortly.', 'AI_SERVICE_UNAVAILABLE')
  } finally {
    clearTimeout(timer)
  }
}

async function getOwnedAnalysisDoc(userId, analysisId) {
  let doc = null
  try {
    doc = await databases.getDocument(config.appwrite.databaseId, COLLECTIONS.resumeAnalyses, analysisId)
  } catch {
    doc = null
  }
  if (!doc || doc.user_id !== userId) {
    throw new ApiError(404, 'Resume analysis not found', 'RESUME_ANALYSIS_NOT_FOUND')
  }
  return doc
}

async function saveResumeAnalysis(userId, fileId, fileName, text, analysis) {
  const { documents } = await databases.listDocuments(
    config.appwrite.databaseId,
    COLLECTIONS.resumeAnalyses,
    [Query.equal('user_id', userId), Query.limit(1)],
  )
  const payload = {
    user_id: userId,
    appwrite_file_id: fileId,
    file_name: String(fileName || '').slice(0, 500),
    extracted_data: String(text || '').slice(0, MAX_EXTRACTED_LENGTH),
    analysis_result: analysis ? JSON.stringify(analysis).slice(0, MAX_ANALYSIS_LENGTH) : '',
  }
  if (documents.length > 0) {
    await databases.updateDocument(
      config.appwrite.databaseId,
      COLLECTIONS.resumeAnalyses,
      documents[0].$id,
      payload,
    )
    return documents[0].$id
  }
  const created = await databases.createDocument(
    config.appwrite.databaseId,
    COLLECTIONS.resumeAnalyses,
    ID.unique(),
    { ...payload, created_at: new Date().toISOString() },
    [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ],
  )
  return created.$id
}

async function updateAnalysisFields(userId, analysisId, fields) {
  await getOwnedAnalysisDoc(userId, analysisId)
  await databases.updateDocument(config.appwrite.databaseId, COLLECTIONS.resumeAnalyses, analysisId, {
    ...fields,
    updated_at: new Date().toISOString(),
  })
}

function resumeJsonToSkillSignals(resumeJson) {
  const signals = []
  const seen = new Set()
  const skills = resumeJson?.skills || {}
  const push = (name) => {
    const key = String(name || '').trim().toLowerCase()
    if (!key || seen.has(key)) return
    seen.add(key)
    signals.push({ skill: String(name).trim(), confidence: 80 })
  }
  for (const category of Object.values(skills)) {
    for (const item of category || []) {
      if (typeof item === 'string') push(item)
      else push(item?.name)
    }
  }
  return signals.slice(0, 16)
}

// ============================================================================
// Stage 1+2 — ingest + AI extraction into structured Resume JSON
// ============================================================================

export async function extractResumePipeline(userId, { fileId, fileName, text, applySkills = false }) {
  let rawText = text || ''
  let pdfBytes = null
  let mimeType = ''
  if (!rawText && fileId) {
    const fetched = await fetchFileBytes(fileId)
    pdfBytes = fetched.bytes
    mimeType = fetched.mimeType
  }
  if (!rawText && !pdfBytes) {
    throw new ApiError(400, 'Upload a resume file or provide its text to analyze.', 'RESUME_CONTENT_REQUIRED')
  }

  const payload = {
    file_name: fileName,
    mime_type: mimeType || undefined,
  }
  if (rawText) {
    payload.text = rawText
  } else {
    payload.pdf = pdfBytes.toString('base64')
  }

  const result = await requestPipeline(payload, '/ai/resume/extract', { timeout: 120000 })
  const resumeJson = result?.resume_json || {}

  const analysisId = await saveResumeAnalysis(
    userId,
    fileId || '',
    fileName,
    result?.raw_text || rawText,
    null,
  )
  await updatePipelineData(userId, analysisId, {
    resume_json: resumeJson,
  })

  let skillsAdded = 0
  if (applySkills) {
    skillsAdded = await applyDetectedSkills(userId, resumeJsonToSkillSignals(resumeJson))
  }

  return {
    source: 'llm',
    analysis_id: analysisId,
    file_name: fileName,
    source_type: result?.source_type || 'text',
    prompt_version: result?.prompt_version || null,
    resume_json: resumeJson,
    raw_text: result?.raw_text || rawText,
    skills_added: skillsAdded,
  }
}

// ============================================================================
// Stage 3 — resume analysis (LLM semantics + deterministic weighting)
// ============================================================================

export async function analyzeResumePipeline(userId, { analysisId, resumeJson: override, jobDescription }) {
  const data = await getPipelineData(userId, analysisId)
  const storedResume = data.resume_json
  if (!storedResume) {
    throw new ApiError(400, 'No extracted resume data found. Run extraction first.', 'RESUME_NOT_EXTRACTED')
  }
  const resumeJson = override || storedResume

  const payload = {
    resume_json: resumeJson,
    job_description: (jobDescription || '').trim() || undefined,
  }
  const doc = await getOwnedAnalysisDoc(userId, analysisId)
  if (doc.extracted_data) payload.raw_text = doc.extracted_data

  const result = await requestPipeline(payload, '/ai/resume/analyze', { timeout: 120000 })
  const analysis = result?.analysis || {}

  await updatePipelineData(userId, analysisId, {
    analysis_json: analysis,
  })

  return {
    analysis_id: analysisId,
    analysis,
  }
}

// ============================================================================
// Stage 4 — job description matching
// ============================================================================

export async function matchResumePipeline(userId, { analysisId, resumeJson: override, jobDescription }) {
  const data = await getPipelineData(userId, analysisId)
  const storedResume = data.resume_json
  if (!storedResume) {
    throw new ApiError(400, 'No extracted resume data found. Run extraction first.', 'RESUME_NOT_EXTRACTED')
  }
  const resumeJson = override || storedResume
  if (!jobDescription || !jobDescription.trim()) {
    throw new ApiError(400, 'Paste a job description to match against.', 'JOB_DESCRIPTION_REQUIRED')
  }

  const result = await requestPipeline(
    { resume_json: resumeJson, job_description: jobDescription },
    '/ai/resume/match',
    { timeout: 120000 },
  )
  const jobMatch = result?.job_match || {}

  await updatePipelineData(userId, analysisId, {
    job_description: String(jobDescription).slice(0, MAX_JOB_DESCRIPTION_LENGTH),
    job_match_json: jobMatch,
  })

  return {
    analysis_id: analysisId,
    job_match: jobMatch,
  }
}

// ============================================================================
// Stage 5 — resume optimization (improve wording, never invent facts)
// ============================================================================

export async function optimizeResumePipeline(userId, { analysisId, resumeJson: override, jobDescription }) {
  const data = await getPipelineData(userId, analysisId)
  const storedResume = data.resume_json
  if (!storedResume) {
    throw new ApiError(400, 'No extracted resume data found. Run extraction first.', 'RESUME_NOT_EXTRACTED')
  }
  const sourceResume = override || storedResume
  const analysis = data.analysis_json
  const jobDescriptionText = (jobDescription || data.job_description || '').trim()

  const payload = { resume_json: sourceResume }
  if (analysis) payload.analysis = analysis
  if (jobDescriptionText) payload.job_description = jobDescriptionText

  const result = await requestPipeline(payload, '/ai/resume/optimize', { timeout: 120000 })
  const optimized = result?.optimized_resume_json || {}

  await updatePipelineData(userId, analysisId, {
    optimized_resume_json: optimized,
  })

  return {
    analysis_id: analysisId,
    optimized_resume_json: optimized,
    prompt_version: result?.prompt_version || null,
  }
}

// ============================================================================
// Stage 6 — Jake LaTeX generation + PDF compilation
// ============================================================================

export async function generateResumePipeline(userId, { analysisId, resumeJson: override, compilePdf = true }) {
  const data = await getPipelineData(userId, analysisId)
  const storedResume = data.resume_json
  if (!storedResume) {
    throw new ApiError(400, 'No extracted resume data found. Run extraction first.', 'RESUME_NOT_EXTRACTED')
  }
  const optimized = data.optimized_resume_json
  const sourceResume = override || optimized || storedResume

  const result = await requestPipeline(
    { resume_json: sourceResume, compile_pdf: compilePdf },
    '/ai/resume/generate',
    { timeout: 120000 },
  )

  const latex = result?.latex || ''
  let pdfFileId = null
  if (result?.compiled && result.pdf_base64) {
    pdfFileId = await storePdfBytes(userId, Buffer.from(result.pdf_base64, 'base64'))
  }

  await updatePipelineData(userId, analysisId, {
    latex_source: latex.slice(0, MAX_LATEX_LENGTH),
  })
  await updateAnalysisFields(userId, analysisId, {
    pdf_file_id: pdfFileId || '',
  })

  return {
    analysis_id: analysisId,
    latex,
    renderer_version: result?.renderer_version || null,
    compiled: Boolean(result?.compiled),
    compiler: result?.compiler || null,
    error: result?.error || null,
    log: result?.log || null,
    pdf_file_id: pdfFileId,
    pdf_url: pdfFileId ? buildPublicPdfUrl(pdfFileId) : null,
  }
}

async function storePdfBytes(userId, bytes) {
  try {
    const file = new File([bytes], `resume-${Date.now()}.pdf`, { type: 'application/pdf' })
    const created = await storage.createFile(config.appwrite.resumeBucketId, ID.unique(), file, [
      Permission.read(Role.user(userId)),
      Permission.update(Role.user(userId)),
      Permission.delete(Role.user(userId)),
    ])
    return created.$id
  } catch {
    return null
  }
}

function buildPublicPdfUrl(fileId) {
  if (!fileId) return null
  const base = (config.appwrite.endpoint || '').replace(/\/v1$/, '')
  return `${base}/storage/buckets/${config.appwrite.resumeBucketId}/files/${fileId}/view?project=${encodeURIComponent(config.appwrite.projectId || '')}`
}

// ============================================================================
// Retrieval
// ============================================================================

function toAnalysisDto(doc, data) {
  data = data || {}
  const resumeJson = data.resume_json ?? null
  const analysis = data.analysis_json ?? null
  const jobMatch = data.job_match_json ?? null
  const optimized = data.optimized_resume_json ?? null
  const legacy = doc.analysis_result ? parseStoredJson(doc.analysis_result) : null
  const dto = {
    file_name: doc.file_name,
    analysis_id: doc.$id,
    source: 'llm',
    resume_json: resumeJson,
    analysis,
    job_description: data.job_description || '',
    job_match: jobMatch,
    optimized_resume_json: optimized,
    latex: data.latex_source || '',
    pdf_file_id: doc.pdf_file_id || '',
    pdf_url: buildPublicPdfUrl(doc.pdf_file_id || ''),
    legacy,
  }
  if (!resumeJson && !analysis && legacy) {
    dto.source = 'legacy'
    dto.analysis = legacy
  }
  return dto
}

export async function getFullResumeAnalysis(userId, analysisId) {
  const doc = await getOwnedAnalysisDoc(userId, analysisId)
  const data = await getPipelineData(userId, analysisId)
  return toAnalysisDto(doc, data)
}

export async function getLatexSource(userId, analysisId) {
  const data = await getPipelineData(userId, analysisId)
  if (!data.latex_source) {
    throw new ApiError(404, 'No generated LaTeX found for this analysis.', 'LATEX_NOT_FOUND')
  }
  return data.latex_source
}

export async function getStoredPdf(userId, analysisId) {
  const doc = await getOwnedAnalysisDoc(userId, analysisId)
  if (!doc.pdf_file_id) {
    throw new ApiError(404, 'No compiled PDF stored for this analysis.', 'PDF_NOT_FOUND')
  }
  try {
    const bytes = await toBuffer(await storage.getFileDownload(config.appwrite.resumeBucketId, doc.pdf_file_id))
    return { bytes, fileName: `resume-${analysisId}.pdf` }
  } catch {
    throw new ApiError(404, 'The PDF file is missing from storage.', 'PDF_NOT_FOUND')
  }
}

// ============================================================================
// Legacy analyze entrypoint (POST /api/resume/analyze-legacy)
// Uses Node-native heuristic analysis (no Python dependency).
// ============================================================================

export async function analyzeResume(userId, { fileId, fileName, text, applySkills = false }) {
  let extractedText = text || ''
  let pdfBytes = null
  if (!extractedText && fileId) {
    const fetched = await fetchFileBytes(fileId)
    pdfBytes = fetched.bytes
  }
  if (!extractedText && !pdfBytes) {
    throw new ApiError(
      400,
      'Upload a resume file or provide its text to analyze.',
      'RESUME_CONTENT_REQUIRED',
    )
  }

  const analysis = computeFallbackAnalysis(extractedText || pdfBytes?.toString() || '')
  const source = 'fallback'

  const analysisId = await saveResumeAnalysis(userId, fileId || '', fileName, extractedText, analysis)

  let skillsAdded = 0
  if (applySkills) {
    skillsAdded = await applyDetectedSkills(userId, analysis.skills || [])
  }

  return {
    source,
    analysis,
    analysis_id: analysisId,
    file_name: fileName,
    skills_added: skillsAdded,
  }
}