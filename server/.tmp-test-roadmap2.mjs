import { generateRoadmap, getRoadmapDetail, removeRoadmap, updateTask } from './src/services/roadmap.service.js'
import { getCareers } from './src/services/appwrite.service.js'

const UID = 'test-roadmap-user'
let roadmapId = null
try {
  const careers = await getCareers()
  const career = careers[0]
  const gen = await generateRoadmap(UID, { careerId: career.$id })
  roadmapId = gen.roadmap.$id
  const first = gen.tasks[0]

  const done = await updateTask(UID, roadmapId, first.$id, { status: 'completed' })
  const completedTask = done.tasks.find((t) => t.$id === first.$id)
  console.log('completed_at after complete:', completedTask.completed_at)

  const reopened = await updateTask(UID, roadmapId, first.$id, { status: 'in_progress' })
  const reopenedTask = reopened.tasks.find((t) => t.$id === first.$id)
  console.log('status after reopen:', reopenedTask.status)
  console.log('completed_at after reopen:', reopenedTask.completed_at)
  if (reopenedTask.status !== 'in_progress') throw new Error('reopen failed')

  // also reorder check: swap indexes 1 and 2 explicitly
  const a = reopened.tasks[0]
  const b = reopened.tasks[1]
  await updateTask(UID, roadmapId, a.$id, { order_index: b.order_index })
  await updateTask(UID, roadmapId, b.$id, { order_index: a.order_index })
  const after = await getRoadmapDetail(UID, roadmapId)
  console.log('order after swap:', after.tasks.slice(0, 2).map((t) => `${t.order_index}:${t.title.slice(0, 20)}`).join(' | '))
  if (after.tasks[0].$id !== b.$id) throw new Error('swap failed')

  console.log('REOPEN + REORDER PASSED')
} finally {
  if (roadmapId) {
    await removeRoadmap(UID, roadmapId).catch(() => {})
    console.log('cleanup done')
  }
}
