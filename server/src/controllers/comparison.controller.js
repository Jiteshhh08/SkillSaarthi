import { compareSelectedCareers } from '../services/comparison.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

export const compareCareersHandler = asyncHandler(async (req, res) => {
  const careerIds = req.body?.career_ids
  if (!Array.isArray(careerIds) || careerIds.length < 2) {
    throw new ApiError(400, 'Select at least two careers to compare.', 'VALIDATION_ERROR')
  }
  const result = await compareSelectedCareers(req.user.$id, careerIds)
  res.json({ success: true, data: result })
})