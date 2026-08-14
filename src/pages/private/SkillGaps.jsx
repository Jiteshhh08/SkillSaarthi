import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getCareer, getCareerSkillGaps, getCareers } from '../../services/careers'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function levelLabel(level) {
  const labels = ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert']
  return labels[Math.floor(level)] || 'Unknown'
}

export default function SkillGaps() {
  const { careerId } = useParams()
  const navigate = useNavigate()
  const [careers, setCareers] = useState([])
  const [selected, setSelected] = useState(careerId || '')
  const [gaps, setGaps] = useState(null)
  const [career, setCareer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    setSelected(careerId || '')
  }, [careerId])

  useEffect(() => {
    let mounted = true
    getCareers()
      .then((list) => {
        if (!mounted) return
        setCareers(list || [])
        if (!careerId && list?.length) setSelected(list[0].$id)
      })
      .catch(() => {
        if (mounted) setError('Could not load the career catalog right now.')
      })
    return () => {
      mounted = false
    }
  }, [careerId])

  const analyze = async (id) => {
    if (!id) return
    setLoading(true)
    setError('')
    setGaps(null)
    try {
      const [gapData, careerData] = await Promise.all([
        getCareerSkillGaps(id),
        getCareer(id),
      ])
      setGaps(gapData)
      setCareer(careerData)
    } catch {
      setGaps(null)
      setCareer(null)
      setError('Could not analyze skill gaps for this career right now.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (selected) analyze(selected)
  }, [selected])

  const selectedCareer = useMemo(
    () => careers.find((item) => item.$id === selected) || career,
    [careers, selected, career],
  )

  const strongCount = gaps?.strong?.length || 0
  const weakCount = gaps?.needs_improvement?.length || 0

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em]">Career intelligence</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Skill Gap Analysis</h1>
            <p className="mt-2 max-w-2xl text-lg text-ink-muted">
              Compare your current skills against a career's required levels to see what you've
              already mastered and what to learn next.
            </p>
          </div>
          <Link to="/recommendations" className="btn-secondary !h-10 !px-4 !text-sm">
            Back to recommendations
          </Link>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <label htmlFor="career-select" className="text-sm font-bold text-ink">
            Career
          </label>
          <div className="relative">
            <select
              id="career-select"
              value={selected}
              onChange={(event) => {
                const id = event.target.value
                setSelected(id)
                navigate(`/skill-gaps/${id}`, { replace: true })
              }}
              className="input-base w-full sm:w-96"
            >
              {careers.length === 0 && <option value="">Loading careers…</option>}
              {careers.map((item) => (
                <option key={item.$id} value={item.$id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[1, 2].map((item) => (
              <div key={item} className="card h-56 animate-pulse bg-warm" />
            ))}
          </div>
        ) : gaps ? (
          <>
            <section className="mt-8 rounded-xl border border-line bg-white px-6 py-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">{gaps.career}</h2>
                  <p className="mt-1 text-sm text-ink-muted">{selectedCareer?.category || ''}</p>
                  {selectedCareer?.description && (
                    <p className="mt-2 max-w-3xl text-sm leading-relaxed text-ink-muted">
                      {selectedCareer.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-3">
                  <span className="rounded-full bg-success-soft px-4 py-1.5 text-sm font-black text-success">
                    {strongCount} strong
                  </span>
                  <span className="rounded-full bg-warning-soft px-4 py-1.5 text-sm font-black text-warning">
                    {weakCount} to grow
                  </span>
                </div>
              </div>
            </section>

            {strongCount > 0 && (
              <section className="mt-6">
                <h3 className="text-base font-black text-success">✓ Skills you already meet</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {gaps.strong.map((entry) => (
                    <div key={entry.skill} className="card flex items-center justify-between gap-3">
                      <div>
                        <p className="font-bold text-ink">{entry.skill}</p>
                        <p className="text-xs text-ink-muted">{levelLabel(entry.current)}</p>
                      </div>
                      <span className="text-xs font-bold text-success">
                        {entry.current}/{entry.required}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {weakCount > 0 && (
              <section className="mt-8">
                <h3 className="text-base font-black text-warning">↑ Skills to grow</h3>
                <p className="mt-1 text-sm text-ink-muted">
                  Add these to your profile or focus your learning roadmap on them.
                </p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {gaps.needs_improvement.map((entry) => (
                    <div
                      key={entry.skill}
                      className="card flex items-center justify-between gap-3 border-l-4 !border-l-warning"
                    >
                      <div>
                        <p className="font-bold text-ink">{entry.skill}</p>
                        <p className="text-xs text-ink-muted">
                          You have {levelLabel(entry.current).toLowerCase()} — need{' '}
                          {levelLabel(entry.required).toLowerCase()}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-warning">
                        {entry.current}/{entry.required}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {!gaps.strong?.length && !weakCount ? (
              <p className="mt-8 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
                No skill-gap data for this career yet.
              </p>
            ) : null}
          </>
        ) : (
          <div className="mt-8 rounded-lg border border-line bg-white px-4 py-10 text-center">
            <p className="text-lg font-bold text-ink">Pick a career to see its skill gaps</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
              Choose a career from the dropdown above to compare your skills against its requirements.
            </p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}