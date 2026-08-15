import {
  addRoadmapTask,
  generateRoadmap,
  getRoadmapDetail,
  listUserRoadmaps,
  removeRoadmap,
  removeTask,
  reorderTasks,
  updateRoadmap,
  updateTask,
} from '../services/roadmap.service.js'
import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'

export const generateRoadmapHandler = asyncHandler(async (req, res) => {
  const careerId = req.body?.career_id
  if (!careerId) {
    throw new ApiError(400, 'career_id is required', 'VALIDATION_ERROR')
  }
  const result = await generateRoadmap(req.user.$id, { careerId, title: req.body?.title })
  res.status(201).json({ success: true, data: result })
})

export const listRoadmapsHandler = asyncHandler(async (req, res) => {
  const roadmaps = await listUserRoadmaps(req.user.$id)
  res.json({ success: true, data: { roadmaps } })
})

export const getRoadmapHandler = asyncHandler(async (req, res) => {
  const result = await getRoadmapDetail(req.user.$id, req.params.id)
  res.json({ success: true, data: result })
})

export const updateRoadmapHandler = asyncHandler(async (req, res) => {
  const { title, status } = req.body || {}
  const result = await updateRoadmap(req.user.$id, req.params.id, { title, status })
  res.json({ success: true, data: result })
})

export const deleteRoadmapHandler = asyncHandler(async (req, res) => {
  await removeRoadmap(req.user.$id, req.params.id)
  res.json({ success: true })
})

export const addTaskHandler = asyncHandler(async (req, res) => {
  const result = await addRoadmapTask(req.user.$id, req.params.id, req.body || {})
  res.status(201).json({ success: true, data: result })
})

export const reorderTasksHandler = asyncHandler(async (req, res) => {
  const order = req.body?.order
  if (!Array.isArray(order)) {
    throw new ApiError(400, 'order (array of task ids) is required', 'VALIDATION_ERROR')
  }
  const result = await reorderTasks(req.user.$id, req.params.id, order)
  res.json({ success: true, data: result })
})

export const updateTaskHandler = asyncHandler(async (req, res) => {
  const result = await updateTask(req.user.$id, req.params.id, req.params.taskId, req.body || {})
  res.json({ success: true, data: result })
})

export const deleteTaskHandler = asyncHandler(async (req, res) => {
  const result = await removeTask(req.user.$id, req.params.id, req.params.taskId)
  res.json({ success: true, data: result })
})
