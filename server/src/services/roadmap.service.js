import { ApiError } from '../utils/ApiError.js'
import {
  createRoadmap,
  createRoadmapTask,
  deleteRoadmap as deleteRoadmapDoc,
  deleteRoadmapTask,
  getCareerById,
  getRoadmap,
  listRoadmapTasks,
  listRoadmaps,
  updateRoadmap as updateRoadmapDoc,
  updateRoadmapTask,
} from './appwrite.service.js'
import { analyzeCareerGaps } from './recommendation.service.js'

const ROADMAP_STATUSES = ['active', 'paused', 'completed']
const TASK_STATUSES = ['pending', 'in_progress', 'paused', 'completed']

function computeProgress(tasks) {
  if (!tasks || tasks.length === 0) return 0
  const done = tasks.filter((task) => task.status === 'completed').length
  return Math.round((done / tasks.length) * 100)
}

function sortTasks(tasks) {
  return tasks.slice().sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
}

// A roadmap that was completed must flip back to active the moment it no longer
// holds every task completed (task reopened, added, or removed).
function progressRoadmapUpdate(roadmap, tasks) {
  const progress = computeProgress(tasks)
  const update = { progress_percent: progress }
  if (roadmap.status === 'completed' && progress < 100) update.status = 'active'
  return update
}

// Reassign contiguous 1..n order_index values (parallel writes for changed rows).
async function renumberTasks(roadmapId, tasks) {
  const sorted = sortTasks(tasks)
  const updates = []
  sorted.forEach((task, i) => {
    if ((task.order_index ?? 0) !== i + 1) {
      updates.push(updateRoadmapTask(task.$id, { order_index: i + 1 }))
    }
  })
  if (updates.length > 0) await Promise.all(updates)
  return sorted.map((task, i) => ({ ...task, order_index: i + 1 }))
}

function buildSkillTasks(gaps, careerName) {
  return (gaps.needs_improvement || []).map((gap) => ({
    title: gap.current > 0 ? `Strengthen ${gap.skill}` : `Learn ${gap.skill}`,
    description: `Required at level ${gap.required} for ${careerName} — you are currently at level ${gap.current}.`,
    estimated_hours: Math.max(1, Math.round((gap.required - gap.current) * 8)),
    status: 'pending',
  }))
}

function buildMilestoneTasks(careerName) {
  return [
    {
      title: `Build a ${careerName} project`,
      description: 'Apply your new skills end-to-end in a portfolio project.',
      estimated_hours: 40,
      status: 'pending',
    },
    {
      title: 'Update resume and prepare for interviews',
      description: 'Showcase your completed skills and practice common interview questions.',
      estimated_hours: 8,
      status: 'pending',
    },
  ]
}

async function assertRoadmapOwner(userId, roadmapId) {
  const roadmap = await getRoadmap(roadmapId)
  if (!roadmap || roadmap.user_id !== userId) {
    throw new ApiError(404, 'Roadmap not found', 'ROADMAP_NOT_FOUND')
  }
  return roadmap
}

export async function generateRoadmap(userId, { careerId, title }) {
  const career = await getCareerById(careerId)
  if (!career) {
    throw new ApiError(404, 'Career not found', 'CAREER_NOT_FOUND')
  }

  const roadmapTitle = title?.trim() || `${career.name} Roadmap`
  const [roadmap, gaps] = await Promise.all([
    createRoadmap(userId, { career_id: careerId, title: roadmapTitle }),
    analyzeCareerGaps(userId, careerId),
  ])
  const taskRows = [...buildSkillTasks(gaps, career.name), ...buildMilestoneTasks(career.name)]

  const tasks = await Promise.all(
    taskRows.map((row, i) => createRoadmapTask(roadmap.$id, { ...row, order_index: i + 1 })),
  )

  return { roadmap, tasks }
}

export async function listUserRoadmaps(userId) {
  const roadmaps = await listRoadmaps(userId)
  return roadmaps
    .slice()
    .sort((a, b) => {
      if (a.status === 'completed' && b.status !== 'completed') return 1
      if (b.status === 'completed' && a.status !== 'completed') return -1
      return new Date(b.created_at || 0) - new Date(a.created_at || 0)
    })
}

export async function getRoadmapDetail(userId, roadmapId) {
  const [roadmap, tasks] = await Promise.all([
    assertRoadmapOwner(userId, roadmapId),
    listRoadmapTasks(roadmapId),
  ])
  return { roadmap, tasks: sortTasks(tasks) }
}

export async function updateRoadmap(userId, roadmapId, { title, status }) {
  await assertRoadmapOwner(userId, roadmapId)

  const update = {}
  if (title !== undefined) {
    const trimmed = String(title).trim()
    if (!trimmed) {
      throw new ApiError(400, 'Roadmap title cannot be empty', 'VALIDATION_ERROR')
    }
    update.title = trimmed
  }

  if (status !== undefined) {
    if (!ROADMAP_STATUSES.includes(status)) {
      throw new ApiError(
        400,
        `status must be one of ${ROADMAP_STATUSES.join(', ')}`,
        'VALIDATION_ERROR',
      )
    }
    update.status = status
    if (status === 'completed') {
      update.progress_percent = 100
      await updateRoadmapDoc(roadmapId, update)
      const tasks = await listRoadmapTasks(roadmapId)
      const completions = tasks
        .filter((task) => task.status !== 'completed')
        .map((task) =>
          updateRoadmapTask(task.$id, {
            status: 'completed',
            completed_at: new Date().toISOString(),
          }),
        )
      if (completions.length > 0) await Promise.all(completions)
      return getRoadmapDetail(userId, roadmapId)
    }
  }

  if (Object.keys(update).length > 0) {
    const tasks = await listRoadmapTasks(roadmapId)
    update.progress_percent = computeProgress(tasks)
    await updateRoadmapDoc(roadmapId, update)
  }

  return getRoadmapDetail(userId, roadmapId)
}

export async function removeRoadmap(userId, roadmapId) {
  await assertRoadmapOwner(userId, roadmapId)
  const tasks = await listRoadmapTasks(roadmapId)
  await Promise.all(tasks.map((task) => deleteRoadmapTask(task.$id)))
  await deleteRoadmapDoc(roadmapId)
}

export async function addRoadmapTask(userId, roadmapId, input) {
  const [roadmap, tasks] = await Promise.all([
    assertRoadmapOwner(userId, roadmapId),
    listRoadmapTasks(roadmapId),
  ])

  const title = String(input.title || '').trim()
  if (!title) {
    throw new ApiError(400, 'Task title is required', 'VALIDATION_ERROR')
  }

  const maxIndex = tasks.reduce((max, task) => Math.max(max, task.order_index ?? 0), 0)
  const orderIndex = Number(input.order_index) > 0 ? Math.round(Number(input.order_index)) : maxIndex + 1

  const created = await createRoadmapTask(roadmapId, {
    title,
    description: String(input.description || '').trim(),
    estimated_hours: Number(input.estimated_hours) > 0 ? Math.round(Number(input.estimated_hours)) : 1,
    order_index: orderIndex,
    status: 'pending',
  })

  const nextTasks = await renumberTasks(roadmapId, [...tasks, created])
  const roadmapUpdate = progressRoadmapUpdate(roadmap, nextTasks)
  await updateRoadmapDoc(roadmapId, roadmapUpdate)
  return { roadmap: { ...roadmap, ...roadmapUpdate }, tasks: nextTasks }
}

export async function updateTask(userId, roadmapId, taskId, input) {
  const [roadmap, tasks] = await Promise.all([
    assertRoadmapOwner(userId, roadmapId),
    listRoadmapTasks(roadmapId),
  ])
  const task = tasks.find((entry) => entry.$id === taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND')
  }

  const update = {}
  if (input.title !== undefined) {
    const title = String(input.title).trim()
    if (!title) {
      throw new ApiError(400, 'Task title cannot be empty', 'VALIDATION_ERROR')
    }
    update.title = title
  }
  if (input.description !== undefined) {
    update.description = String(input.description).trim()
  }
  if (input.estimated_hours !== undefined) {
    update.estimated_hours = Math.max(0, Math.round(Number(input.estimated_hours) || 0))
  }
  if (input.order_index !== undefined) {
    update.order_index = Math.max(1, Math.round(Number(input.order_index) || 1))
  }
  if (input.status !== undefined) {
    if (!TASK_STATUSES.includes(input.status)) {
      throw new ApiError(400, `status must be one of ${TASK_STATUSES.join(', ')}`, 'VALIDATION_ERROR')
    }
    update.status = input.status
    if (input.status === 'completed') {
      update.completed_at = new Date().toISOString()
    } else {
      update.completed_at = null
    }
  }

  const merged = tasks.map((entry) => (entry.$id === taskId ? { ...entry, ...update } : entry))
  const roadmapUpdate = progressRoadmapUpdate(roadmap, merged)
  const writes = [updateRoadmapDoc(roadmapId, roadmapUpdate)]
  if (Object.keys(update).length > 0) writes.unshift(updateRoadmapTask(taskId, update))
  await Promise.all(writes)
  return { roadmap: { ...roadmap, ...roadmapUpdate }, tasks: sortTasks(merged) }
}

export async function reorderTasks(userId, roadmapId, orderedIds) {
  const [roadmap, tasks] = await Promise.all([
    assertRoadmapOwner(userId, roadmapId),
    listRoadmapTasks(roadmapId),
  ])

  if (!Array.isArray(orderedIds) || orderedIds.length !== tasks.length) {
    throw new ApiError(400, 'order must contain every task id exactly once', 'VALIDATION_ERROR')
  }

  const byId = new Map(tasks.map((task) => [task.$id, task]))
  const ordered = orderedIds.map((taskId, i) => {
    const task = byId.get(taskId)
    if (!task) {
      throw new ApiError(400, `Unknown task id in order: ${taskId}`, 'VALIDATION_ERROR')
    }
    return { ...task, order_index: i + 1 }
  })

  const updates = []
  ordered.forEach((task, i) => {
    if ((byId.get(task.$id).order_index ?? 0) !== i + 1) {
      updates.push(updateRoadmapTask(task.$id, { order_index: i + 1 }))
    }
  })

  const roadmapUpdate = progressRoadmapUpdate(roadmap, ordered)
  updates.push(updateRoadmapDoc(roadmapId, roadmapUpdate))
  await Promise.all(updates)
  return { roadmap: { ...roadmap, ...roadmapUpdate }, tasks: ordered }
}

export async function removeTask(userId, roadmapId, taskId) {
  const [roadmap, tasks] = await Promise.all([
    assertRoadmapOwner(userId, roadmapId),
    listRoadmapTasks(roadmapId),
  ])
  const task = tasks.find((entry) => entry.$id === taskId)
  if (!task) {
    throw new ApiError(404, 'Task not found', 'TASK_NOT_FOUND')
  }

  await deleteRoadmapTask(taskId)
  const nextTasks = await renumberTasks(roadmapId, tasks.filter((entry) => entry.$id !== taskId))
  const roadmapUpdate = progressRoadmapUpdate(roadmap, nextTasks)
  await updateRoadmapDoc(roadmapId, roadmapUpdate)
  return { roadmap: { ...roadmap, ...roadmapUpdate }, tasks: nextTasks }
}
