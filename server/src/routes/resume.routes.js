import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { analyzeResume } from '../services/resume.service.js'
import { COLLECTIONS, databases } from '../config/appwrite.js'
import { config } from '../config/environment.js'

const router = Router()

router.use(requireAuth)

router.post(
  '/analyze',
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

router.get(
  '/analysis/:id',
  asyncHandler(async (req, res) => {
    let analysis = null
    try {
      analysis = await databases.getDocument(
        config.appwrite.databaseId,
        COLLECTIONS.resumeAnalyses,
        req.params.id,
      )
    } catch {
      analysis = null
    }

    if (!analysis || analysis.user_id !== req.user.$id) {
      throw new ApiError(404, 'Resume analysis not found', 'RESUME_ANALYSIS_NOT_FOUND')
    }

    res.json({
      success: true,
      data: {
        file_name: analysis.file_name,
        analysis_id: analysis.$id,
        analysis: JSON.parse(analysis.analysis_result || '{}'),
      },
    })
  }),
)

export default router
