import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import {
  addTaskHandler,
  deleteRoadmapHandler,
  deleteTaskHandler,
  generateRoadmapHandler,
  getRoadmapHandler,
  listRoadmapsHandler,
  reorderTasksHandler,
  updateRoadmapHandler,
  updateTaskHandler,
} from '../controllers/roadmap.controller.js'

const router = Router()

router.use(requireAuth)

router.post('/', generateRoadmapHandler)
router.get('/', listRoadmapsHandler)
router.post('/:id/tasks', addTaskHandler)
router.put('/:id/tasks', reorderTasksHandler)
router.put('/:id/tasks/:taskId', updateTaskHandler)
router.delete('/:id/tasks/:taskId', deleteTaskHandler)
router.get('/:id', getRoadmapHandler)
router.put('/:id', updateRoadmapHandler)
router.delete('/:id', deleteRoadmapHandler)

export default router
