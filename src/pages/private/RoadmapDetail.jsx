import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  addRoadmapTask,
  deleteRoadmap,
  deleteRoadmapTask,
  getRoadmap,
  reorderRoadmapTasks,
  updateRoadmap,
  updateRoadmapTask,
} from '../../services/roadmaps'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function taskStatusChip(status) {
  if (status === 'completed') return 'bg-success-soft text-success'
  if (status === 'in_progress') return 'bg-info-soft text-info'
  if (status === 'paused') return 'bg-warning-soft text-warning'
  return 'bg-surface-soft text-ink-soft'
}

export default function RoadmapDetail() {
  const { id } = useParams()

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const [editTitle, setEditTitle] = useState('')
  const [renaming, setRenaming] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newHours, setNewHours] = useState('')
  const [adding, setAdding] = useState(false)

  const load = useCallback(async () => {
    setError('')
    try {
      const result = await getRoadmap(id)
      setDetail(result)
      setEditTitle(result?.roadmap?.title || '')
    } catch (err) {
      setDetail(null)
      setError(err?.response?.data?.message || 'Could not load this roadmap.')
    }
  }, [id])

  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [load])

  const run = async (action) => {
    setBusy(true)
    setError('')
    try {
      const result = await action()
      setDetail(result)
      setEditTitle(result?.roadmap?.title || '')
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  const setTaskStatus = (taskId, status) =>
    run(() => updateRoadmapTask(id, taskId, { status }))

  const moveTask = async (taskId, direction) => {
    const ordered = detail.tasks.map((task) => task.$id)
    const index = ordered.indexOf(taskId)
    const target = index + direction
    if (index === -1 || target < 0 || target >= ordered.length) return
    const [moved] = ordered.splice(index, 1)
    ordered.splice(target, 0, moved)
    await run(() => reorderRoadmapTasks(id, ordered))
  }

  const handleSaveTitle = (event) => {
    event.preventDefault()
    if (!editTitle.trim()) return
    run(() => updateRoadmap(id, { title: editTitle.trim() })).then(() => setRenaming(false))
  }

  const handleAddTask = (event) => {
    event.preventDefault()
    if (!newTitle.trim()) return
    run(() =>
      addRoadmapTask(id, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        estimated_hours: newHours ? Number(newHours) : undefined,
      }),
    ).then(() => {
      setNewTitle('')
      setNewDescription('')
      setNewHours('')
      setAdding(false)
    })
  }

  const handleDeleteRoadmap = async () => {
    if (!window.confirm('Delete this roadmap and all of its tasks?')) return
    await deleteRoadmap(id)
    window.location.href = '/roadmaps'
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="flex min-h-[60vh] items-center justify-center text-ink-muted">Loading…</div>
        <Footer />
      </div>
    )
  }

  if (!detail) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <main className="mx-auto max-w-7xl px-6 py-10">
          <p className="text-lg font-bold text-ink">Roadmap not found</p>
          {error && <p className="mt-2 text-sm text-ink-muted">{error}</p>}
          <Link to="/roadmaps" className="btn-secondary mt-6 !h-10 !px-4 !text-sm">
            Back to roadmaps
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  const { roadmap, tasks } = detail
  const totalHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0)

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Link to="/roadmaps" className="text-sm font-bold text-brand-deep hover:underline">
          ← All roadmaps
        </Link>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em]">Roadmap</p>
            {renaming ? (
              <form onSubmit={handleSaveTitle} className="mt-2 flex items-center gap-2">
                <input
                  value={editTitle}
                  onChange={(event) => setEditTitle(event.target.value)}
                  className="rounded-lg border border-line bg-white px-3 py-2 text-xl font-black text-ink"
                />
                <button type="submit" disabled={busy} className="btn-primary !h-10 !px-4 !text-sm">
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setRenaming(false)}
                  className="btn-secondary !h-10 !px-4 !text-sm"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <h1 className="mt-2 text-3xl font-black tracking-tight">{roadmap.title}</h1>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-black ${taskStatusChip(roadmap.status)}`}>
              {roadmap.status}
            </span>
            {!renaming && (
              <button onClick={() => setRenaming(true)} className="btn-secondary !h-10 !px-4 !text-sm">
                Rename
              </button>
            )}
            {roadmap.status !== 'completed' && (
              <button
                onClick={() => run(() => updateRoadmap(id, { status: 'completed' }))}
                disabled={busy}
                className="btn-primary !h-10 !px-4 !text-sm"
              >
                Mark completed
              </button>
            )}
            <button onClick={handleDeleteRoadmap} className="btn-text !text-sm text-danger">
              Delete
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-line bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <span className="font-bold text-ink-soft">
              {tasks.length} task{tasks.length === 1 ? '' : 's'} · ≈ {totalHours} hours
            </span>
            <span className="font-black text-brand-deep">{roadmap.progress_percent}% complete</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-strong">
            <div
              className="h-full rounded-full bg-brand transition-all"
              style={{ width: `${roadmap.progress_percent || 0}%` }}
            />
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        <section className="mt-8">
          <h2 className="text-2xl font-bold tracking-tight">Tasks</h2>
          <div className="mt-4 space-y-3">
            {tasks.length === 0 ? (
              <div className="rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
                No tasks yet — add one below.
              </div>
            ) : (
              tasks.map((task, index) => (
                <article
                  key={task.$id}
                  className={`card flex flex-wrap items-start justify-between gap-4 ${
                    task.status === 'completed' ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-surface-strong text-xs font-black text-ink-soft">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h3 className={`font-bold text-ink ${task.status === 'completed' ? 'line-through' : ''}`}>
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{task.description}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-black ${taskStatusChip(task.status)}`}>
                          {task.status}
                        </span>
                        {task.estimated_hours > 0 && (
                          <span className="text-xs font-bold text-ink-soft">
                            ≈ {task.estimated_hours} hours
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => moveTask(task.$id, -1)}
                      disabled={index === 0 || busy}
                      className="btn-secondary !h-9 !w-9 !px-0 !text-sm"
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveTask(task.$id, 1)}
                      disabled={index === tasks.length - 1 || busy}
                      className="btn-secondary !h-9 !w-9 !px-0 !text-sm"
                      title="Move down"
                    >
                      ↓
                    </button>
                    {task.status === 'pending' && (
                      <button
                        onClick={() => setTaskStatus(task.$id, 'in_progress')}
                        disabled={busy}
                        className="btn-primary !h-9 !px-3 !text-xs"
                      >
                        Start
                      </button>
                    )}
                    {task.status === 'in_progress' && (
                      <button
                        onClick={() => setTaskStatus(task.$id, 'paused')}
                        disabled={busy}
                        className="btn-secondary !h-9 !px-3 !text-xs"
                      >
                        Pause
                      </button>
                    )}
                    {(task.status === 'in_progress' || task.status === 'paused') && (
                      <button
                        onClick={() => setTaskStatus(task.$id, 'completed')}
                        disabled={busy}
                        className="btn-primary !h-9 !px-3 !text-xs"
                      >
                        Complete
                      </button>
                    )}
                    {task.status === 'paused' && (
                      <button
                        onClick={() => setTaskStatus(task.$id, 'in_progress')}
                        disabled={busy}
                        className="btn-secondary !h-9 !px-3 !text-xs"
                      >
                        Resume
                      </button>
                    )}
                    {task.status === 'completed' && (
                      <button
                        onClick={() => setTaskStatus(task.$id, 'in_progress')}
                        disabled={busy}
                        className="btn-secondary !h-9 !px-3 !text-xs"
                      >
                        Reopen
                      </button>
                    )}
                    <button
                      onClick={() => run(() => deleteRoadmapTask(id, task.$id))}
                      disabled={busy}
                      className="btn-text !text-xs text-danger"
                      title="Delete task"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          <h2 className="text-lg font-black">Add a custom task</h2>
          {adding ? (
            <form onSubmit={handleAddTask} className="mt-4 grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-xs font-black uppercase tracking-wide text-ink-muted">Title</span>
                <input
                  value={newTitle}
                  onChange={(event) => setNewTitle(event.target.value)}
                  required
                  placeholder="e.g. Build a REST API"
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-ink-muted">
                  Description (optional)
                </span>
                <input
                  value={newDescription}
                  onChange={(event) => setNewDescription(event.target.value)}
                  placeholder="e.g. Follow the official docs"
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted"
                />
              </label>
              <label className="block">
                <span className="text-xs font-black uppercase tracking-wide text-ink-muted">
                  Estimated hours (optional)
                </span>
                <input
                  value={newHours}
                  onChange={(event) => setNewHours(event.target.value)}
                  type="number"
                  min="1"
                  placeholder="e.g. 8"
                  className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted"
                />
              </label>
              <div className="flex items-center gap-3 md:col-span-2">
                <button type="submit" disabled={busy} className="btn-primary !h-10 !px-4 !text-sm">
                  Add task
                </button>
                <button
                  type="button"
                  onClick={() => setAdding(false)}
                  className="btn-secondary !h-10 !px-4 !text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button onClick={() => setAdding(true)} className="btn-secondary mt-4 !h-10 !px-4 !text-sm">
              + Add custom task
            </button>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
