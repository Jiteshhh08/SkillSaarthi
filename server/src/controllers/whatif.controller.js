import { simulateUserScenario } from '../services/whatif.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

export const simulateHandler = asyncHandler(async (req, res) => {
  const changes = req.body?.changes
  if (!changes || typeof changes !== 'object') {
    throw new ApiError(400, 'Describe at least one change to simulate.', 'VALIDATION_ERROR')
  }
  const topN = Number.isInteger(req.body?.top_n) ? req.body.top_n : 8
  const result = await simulateUserScenario(req.user.$id, changes, topN)
  res.json({ success: true, data: result })
})