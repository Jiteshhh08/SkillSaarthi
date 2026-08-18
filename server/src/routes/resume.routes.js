import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import {
  analyzeResume,
  analyzeResumePipeline,
  extractResumePipeline,
  generateResumePipeline,
  getFullResumeAnalysis,
  getLatexSource,
  getStoredPdf,
  matchResumePipeline,
  optimizeResumePipeline,
} from '../services/resume.service.js'

const router = Router()

router.use(requireAuth)

function parseJsonBody(value) {
  if (!value) return undefined
  if (typeof value === 'object') return value
  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

// Legacy rule-based read (kept for compatibility).
router.post(
  '/analyze-legacy',
  asyncHandler(async (req, res) => {
    const fileId = String(req.body?.file_id || '').trim()
    const text = String(req.body?.text || '')
    const fileName = String(req.body?.file_name || '')
    const applySkills = req.body?.apply_skills === true

    if (!fileId && !text.trim()) {
      throw new ApiError(
        400,
        'Upload a resume file or provide its text to analyze.',
        'RESUME_CONTENT_REQUIRED',
      )
    }

    const result = await analyzeResume(req.user.$id, {
      fileId,
      fileName,
      text,
      applySkills,
    })
    res.json({ success: true, data: result })
  }),
)

// Stage 1+2 — ingest + AI extraction into structured Resume JSON.
router.post(
  '/extract',
  asyncHandler(async (req, res) => {
    const fileId = String(req.body?.file_id || '').trim()
    const text = String(req.body?.text || '')
    const fileName = String(req.body?.file_name || '')
    const applySkills = req.body?.apply_skills === true

    if (!fileId && !text.trim()) {
      throw new ApiError(
        400,
        'Upload a resume file or provide its text to analyze.',
        'RESUME_CONTENT_REQUIRED',
      )
    }

    const result = await extractResumePipeline(req.user.$id, { fileId, fileName, text, applySkills })
    res.json({ success: true, data: result })
  }),
)

// Stage 3 — resume analysis (LLM semantics + deterministic scoring).
router.post(
  '/analyze',
  asyncHandler(async (req, res) => {
    const analysisId = String(req.body?.analysis_id || '')
    const resumeJson = parseJsonBody(req.body?.resume_json)
    const jobDescription = String(req.body?.job_description || '')

    if (!analysisId) {
      throw new ApiError(400, 'analysis_id is required.', 'ANALYSIS_ID_REQUIRED')
    }

    const result = await analyzeResumePipeline(req.user.$id, {
      analysisId,
      resumeJson,
      jobDescription,
    })
    res.json({ success: true, data: result })
  }),
)

// Stage 4 — job-description matching.
router.post(
  '/match',
  asyncHandler(async (req, res) => {
    const analysisId = String(req.body?.analysis_id || '')
    const resumeJson = parseJsonBody(req.body?.resume_json)
    const jobDescription = String(req.body?.job_description || '')

    if (!analysisId) {
      throw new ApiError(400, 'analysis_id is required.', 'ANALYSIS_ID_REQUIRED')
    }

    const result = await matchResumePipeline(req.user.$id, {
      analysisId,
      resumeJson,
      jobDescription,
    })
    res.json({ success: true, data: result })
  }),
)

// Stage 5 — resume optimization.
router.post(
  '/optimize',
  asyncHandler(async (req, res) => {
    const analysisId = String(req.body?.analysis_id || '')
    const resumeJson = parseJsonBody(req.body?.resume_json)
    const jobDescription = String(req.body?.job_description || '')

    if (!analysisId) {
      throw new ApiError(400, 'analysis_id is required.', 'ANALYSIS_ID_REQUIRED')
    }

    const result = await optimizeResumePipeline(req.user.$id, {
      analysisId,
      resumeJson,
      jobDescription,
    })
    res.json({ success: true, data: result })
  }),
)

// Stage 6 — Jake LaTeX generation + PDF compilation.
router.post(
  '/generate',
  asyncHandler(async (req, res) => {
    const analysisId = String(req.body?.analysis_id || '')
    const resumeJson = parseJsonBody(req.body?.resume_json)
    const compilePdf = req.body?.compile_pdf !== false

    if (!analysisId) {
      throw new ApiError(400, 'analysis_id is required.', 'ANALYSIS_ID_REQUIRED')
    }

    const result = await generateResumePipeline(req.user.$id, { analysisId, resumeJson, compilePdf })
    res.json({ success: true, data: result })
  }),
)

router.get(
  '/analysis/:id',
  asyncHandler(async (req, res) => {
    const data = await getFullResumeAnalysis(req.user.$id, req.params.id)
    res.json({ success: true, data })
  }),
)

router.get(
  '/analysis/:id/tex',
  asyncHandler(async (req, res) => {
    const latex = await getLatexSource(req.user.$id, req.params.id)
    res.setHeader('Content-Type', 'text/plain; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="resume-${req.params.id}.tex"`)
    res.send(latex)
  }),
)

router.get(
  '/analysis/:id/pdf',
  asyncHandler(async (req, res) => {
    const { bytes, fileName } = await getStoredPdf(req.user.$id, req.params.id)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`)
    res.send(bytes)
  }),
)

export default router