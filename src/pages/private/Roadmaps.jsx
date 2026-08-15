import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getCareers } from '../../services/careers'
import { createRoadmap, deleteRoadmap, getRoadmaps } from '../../services/roadmaps'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function statusChip(status) {
  if (status === 'completed') return 'bg-success-soft text-success'
  if (status === 'paused') return 'bg-warning-soft text-warning'
  return 'bg-brand-soft text-brand-deep'
}

export default function Roadmaps() {
  const navigate = useNavigate()
  const [roadmaps, setRoadmaps] = useState([])
  const [careers, setCareers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [careerId, setCareerId] = useState('')
  const [title, setTitle] = useState('')
  const [generating, setGenerating] = useState(false)

  const load = async () => {
    setError('')
    try {
      const docs = await getRoadmaps()
      setRoadmaps(docs || [])
    } catch {
      setRoadmaps([])
      setError('Could not load roadmaps right now. Please try again shortly.')
    }
  }

  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    getCareers()
      .then((docs) => setCareers(docs || []))
      .catch(() => setCareers([]))
  }, [])

  const handleGenerate = async (event) => {
    event.preventDefault()
    if (!careerId) return
    setGenerating(true)
    setError('')
    try {
      const result = await createRoadmap(careerId, title.trim() || undefined)
      navigate(`/roadmaps/${result.roadmap.$id}`)
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not generate the roadmap. Please try again.')
      setGenerating(false)
    }
  }

  const handleDelete = async (roadmapId) => {
    if (!window.confirm('Delete this roadmap and all of its tasks?')) return
    setError('')
    try {
      await deleteRoadmap(roadmapId)
      await load()
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not delete the roadmap.')
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Roadmap</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Your Learning Roadmaps</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-muted">
          Ordered plans built from your skill gaps for a target career. Start tasks, track
          progress, and add your own steps along the way.
        </p>

        <div className="mt-6 rounded-xl border border-accent-yellow bg-cream px-5 py-4 text-sm text-ink">
          <p>
            Roadmaps are generated from your current{' '}
            <Link to="/skill-gaps" className="font-bold text-brand-deep hover:underline">
              skill-gap analysis
            </Link>
            . Keep your profile up to date and regenerate for the best plan.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        <section className="mt-8 rounded-xl border border-line bg-white p-6">
          <h2 className="text-lg font-black">Generate a new roadmap</h2>
          <form onSubmit={handleGenerate} className="mt-4 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-ink-muted">Target career</span>
              <select
                value={careerId}
                onChange={(event) => setCareerId(event.target.value)}
                required
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink"
              >
                <option value="" disabled>
                  Select a career…
                </option>
                {careers.map((career) => (
                  <option key={career.$id} value={career.$id}>
                    {career.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs font-black uppercase tracking-wide text-ink-muted">
                Roadmap title (optional)
              </span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Full Stack Roadmap"
                className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-sm text-ink placeholder:text-ink-muted"
              />
            </label>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={generating || !careerId}
                className="btn-primary !h-[42px] !px-5 !text-sm"
              >
                {generating ? 'Generating…' : 'Generate roadmap'}
              </button>
            </div>
          </form>
        </section>

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="card h-40 animate-pulse bg-warm" />
            ))}
          </div>
        ) : roadmaps.length > 0 ? (
          <section className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight">Your roadmaps</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {roadmaps.map((roadmap) => (
                <article key={roadmap.$id} className="card flex flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-lg font-bold text-ink">{roadmap.title}</h3>
                    <span className={`rounded-full px-3 py-1 text-xs font-black ${statusChip(roadmap.status)}`}>
                      {roadmap.status}
                    </span>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-ink-soft">Progress</span>
                      <span className="font-black text-brand-deep">{roadmap.progress_percent}%</span>
                    </div>
                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
                      <div
                        className="h-full rounded-full bg-brand transition-all"
                        style={{ width: `${roadmap.progress_percent || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <Link
                      to={`/roadmaps/${roadmap.$id}`}
                      className="btn-primary !h-10 !px-4 !text-sm"
                    >
                      Open roadmap
                    </Link>
                    <button
                      onClick={() => handleDelete(roadmap.$id)}
                      className="btn-text !text-sm text-danger"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ) : (
          <div className="mt-8 rounded-lg border border-line bg-white px-4 py-10 text-center">
            <p className="text-lg font-bold text-ink">No roadmaps yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
              Pick a career above to generate your first ordered learning plan.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
