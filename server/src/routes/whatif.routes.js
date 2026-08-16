import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { simulateHandler } from '../controllers/whatif.controller.js'

const router = Router()

router.use(requireAuth)

router.post('/simulate', simulateHandler)

export default router