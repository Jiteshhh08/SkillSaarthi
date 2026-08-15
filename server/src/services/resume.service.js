import { COLLECTIONS, ID, Permission, Query, Role, databases, storage } from '../config/appwrite.js'
import { config } from '../config/environment.js'
import { ApiError } from '../utils/ApiError.js'
import { applyDetectedSkills } from './github.service.js'

const AI_TIMEOUT_MS = 25000
const MAX_EXTRACTED_LENGTH = 2000
const MAX_ANALYSIS_LENGTH = 6000

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

async function toBuffer(value) {
  if (Buffer.isBuffer(value)) return value
  if (value instanceof ArrayBuffer) return Buffer.from(value)
  if (ArrayBuffer.isView(value)) return Buffer.from(value.buffer, value.byteOffset, value.byteLength)
  if (value && typeof value.arrayBuffer === 'function') {
    return Buffer.from(await value.arrayBuffer())
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

async function requestAiAnalysis(payload) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS)
  try {
    const response = await fetch(`${config.aiServiceUrl}/ai/resume/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
    if (!response.ok) return null
    const body = await response.json()
    return body?.analysis || null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
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
    analysis_result: JSON.stringify(analysis).slice(0, MAX_ANALYSIS_LENGTH),
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

  const aiAnalysis = extractedText
    ? await requestAiAnalysis({ text: extractedText, file_name: fileName })
    : await requestAiAnalysis({
        pdf: pdfBytes.toString('base64'),
        file_name: fileName,
      })

  const source = aiAnalysis ? 'full' : 'fallback'
  const analysis = aiAnalysis || computeFallbackAnalysis(extractedText || pdfBytes?.toString() || '')

  const analysisId = await saveResumeAnalysis(userId, fileId || '', fileName, extractedText, analysis)

  let skillsAdded = 0
  if (applySkills) {
    skillsAdded = await applyDetectedSkills(userId, analysis.skills || [])
  }

  return {
    source,
    analysis,
    analysis_id: analysisId,
    skills_added: skillsAdded,
  }
}
