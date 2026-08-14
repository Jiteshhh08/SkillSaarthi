import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import {
  generateRecommendationsHandler,
  getRecommendationHandler,
  getRecommendationsHandler,
  getSkillGapsHandler,
} from '../controllers/recommendation.controller.js'

const router = Router()

router.use(requireAuth)

router.post('/generate', generateRecommendationsHandler)
router.get('/', getRecommendationsHandler)
router.get('/careers/:careerId/skill-gaps', getSkillGapsHandler)
router.get('/:id', getRecommendationHandler)

export default router