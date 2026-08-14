import { getCareer, listCareers } from '../services/career.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'

export const getCareersHandler = asyncHandler(async (_req, res) => {
  const careers = await listCareers()
  res.json({ success: true, data: { careers } })
})

export const getCareerHandler = asyncHandler(async (req, res) => {
  const career = await getCareer(req.params.careerId)
  res.json({ success: true, data: { career } })
})