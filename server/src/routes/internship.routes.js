import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { listInternships, recommendInternships } from '../services/internship.service.js'

const router = Router()

router.use(requireAuth)

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { search = '', company = '', location = '' } = req.query
    const internships = await listInternships({ search, company, location })
    res.json({ success: true, data: { internships } })
  }),
)

router.get(
  '/recommended',
  asyncHandler(async (req, res) => {
    const recommendations = await recommendInternships(req.user.$id)
    res.json({ success: true, data: { recommendations } })
  }),
)

export default router