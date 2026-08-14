import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { getCareerHandler, getCareersHandler } from '../controllers/career.controller.js'

const router = Router()

router.use(requireAuth)

router.get('/', getCareersHandler)
router.get('/:careerId', getCareerHandler)

export default router