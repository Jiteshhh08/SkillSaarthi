import {
  analyzeCareerGaps,
  generateRecommendations,
  getRecommendationById,
  getSavedRecommendations,
} from '../services/recommendation.service.js'
import { notify } from '../services/notification.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

export const generateRecommendationsHandler = asyncHandler(async (req, res) => {
  const topN = req.body?.top_n ? Number(req.body.top_n) : 6
  const recommendations = await generateRecommendations(req.user.$id, topN)
  await notify(req.user.$id, 'Career matches ready ✨', 'Your latest career recommendations are ready to review.')
  res.json({ success: true, data: { recommendations } })
})

export const getRecommendationsHandler = asyncHandler(async (req, res) => {
  const recommendations = await getSavedRecommendations(req.user.$id)
  res.json({ success: true, data: { recommendations } })
})

export const getRecommendationHandler = asyncHandler(async (req, res) => {
  const recommendation = await getRecommendationById(req.user.$id, req.params.id)
  res.json({ success: true, data: { recommendation } })
})

export const getSkillGapsHandler = asyncHandler(async (req, res) => {
  const careerId = req.params.careerId
  if (!careerId) {
    throw new ApiError(400, 'careerId is required', 'VALIDATION_ERROR')
  }
  const gaps = await analyzeCareerGaps(req.user.$id, careerId)
  res.json({ success: true, data: { gaps } })
})