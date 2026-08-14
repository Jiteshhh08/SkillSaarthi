import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { analyzeGitHub, GITHUB_USERNAME_PATTERN } from '../services/github.service.js'
import { COLLECTIONS, databases } from '../config/appwrite.js'
import { config } from '../config/environment.js'

const router = Router()

router.use(requireAuth)

router.post(
  '/analyze',
  asyncHandler(async (req, res) => {
    const username = String(req.body?.username || '').trim()
    const applySkills = req.body?.apply_skills === true

    if (!GITHUB_USERNAME_PATTERN.test(username)) {
      throw new ApiError(
        400,
        'Enter a valid GitHub username (letters, numbers and single hyphens only).',
        'INVALID_GITHUB_USERNAME',
      )
    }

    const result = await analyzeGitHub(req.user.$id, username, { applySkills })
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
        COLLECTIONS.githubAnalyses,
        req.params.id,
      )
    } catch {
      analysis = null
    }

    if (!analysis || analysis.user_id !== req.user.$id) {
      throw new ApiError(404, 'GitHub analysis not found', 'GITHUB_ANALYSIS_NOT_FOUND')
    }

    res.json({
      success: true,
      data: {
        username: analysis.github_username,
        analysis_id: analysis.$id,
        analysis: JSON.parse(analysis.analysis_result || '{}'),
      },
    })
  }),
)

export default router