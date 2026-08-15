import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { compareCareersHandler } from '../controllers/comparison.controller.js'

const router = Router()

router.use(requireAuth)

router.post('/compare', compareCareersHandler)

export default router