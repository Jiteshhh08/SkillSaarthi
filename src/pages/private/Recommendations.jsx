import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { generateRecommendations, getRecommendations } from '../../services/recommendations'
import { getCareerSkillGaps } from '../../services/careers'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function scoreTone(score) {
  if (score >= 80) return 'bg-success-soft text-success'
  if (score >= 60) return 'bg-warning-soft text-warning'
  return 'bg-danger-soft text-danger'
}

function RecommendationCard({ recommendation, onViewGaps }) {
  const explanation = recommendation.explanation || {}
  const careerName = explanation.career || recommendation.career_id
  const reasons = explanation.reasons || []
  const gaps = explanation.skill_gaps || []

  return (
    <article className="card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">{careerName}</h3>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
            {explanation.category || 'Career match'}
          </p>
        </div>
        <div className="flex items-start gap-2">
          {explanation.source === 'fallback' && (
            <span className="rounded-full bg-warning-soft px-3 py-1 text-xs font-black text-warning">
              Estimated · AI offline
            </span>
          )}
          <span className={`rounded-full px-3 py-1 text-sm font-black ${scoreTone(recommendation.match_score)}`}>
            {recommendation.match_score}%
          </span>
        </div>
      </div>

      {explanation.description && (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{explanation.description}</p>
      )}

      {reasons.length > 0 && (
        <div className="mt-4 rounded-md bg-surface-soft px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-ink-muted">Why it's a match</p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink-soft">Skills to grow</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {gaps.map((gap) => (
              <span key={`${recommendation.$id}-${gap}`} className="chip !px-2.5 !py-0.5 !text-xs">
                {gap}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <button onClick={() => onViewGaps(recommendation.career_id)} className="btn-secondary !h-10 !px-4 !text-sm">
          View skill gaps
        </button>
        <Link to={`/roadmaps`} className="btn-text !h-10 !px-3 !text-sm">
          Create roadmap →
        </Link>
      </div>
    </article>
  )
}

function GapDrawer({ careerId, onClose }) {
  const [gaps, setGaps] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let mounted = true
    setLoading(true)
    setError('')
    getCareerSkillGaps(careerId)
      .then((data) => {
        if (!mounted) return
        setGaps(data)
      })
      .catch(() => {
        if (mounted) setError('Could not load skill gaps.')
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [careerId])

  const levelLabel = (l) => ['', 'Beginner', 'Basic', 'Intermediate', 'Advanced', 'Expert'][Math.floor(l)] || '—'

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-line bg-white p-6 shadow-modal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-black tracking-tight">{gaps?.career || 'Skill gaps'}</h3>
          <button onClick={onClose} className="btn-secondary !h-9 !px-3 !text-sm">
            Close
          </button>
        </div>
        {loading ? (
          <div className="mt-4 h-40 animate-pulse rounded-lg bg-warm" />
        ) : error ? (
          <p className="mt-4 rounded-lg bg-danger-soft px-4 py-3 text-sm font-bold text-danger">{error}</p>
        ) : gaps ? (
          <>
            <div className="mt-4 flex gap-2">
              <span className="rounded-full bg-success-soft px-3 py-1 text-sm font-black text-success">{gaps.strong?.length || 0} strong</span>
              <span className="rounded-full bg-warning-soft px-3 py-1 text-sm font-black text-warning">{gaps.needs_improvement?.length || 0} to grow</span>
            </div>
            {gaps.strong?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-black text-success">✓ Already meet</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {gaps.strong.map((s) => (
                    <div key={s.skill} className="flex items-center justify-between rounded-md border border-line-soft bg-surface-soft px-3 py-2">
                      <span className="text-sm font-bold">{s.skill}</span>
                      <span className="text-xs font-bold text-success">{s.current}/{s.required} {levelLabel(s.current)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {gaps.needs_improvement?.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-black text-warning">↑ To grow</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {gaps.needs_improvement.map((s) => (
                    <div key={s.skill} className="flex items-center justify-between rounded-md border-l-4 border-warning bg-white px-3 py-2 shadow-sm">
                      <span className="text-sm font-bold">{s.skill}</span>
                      <span className="text-xs font-bold text-warning">{s.current}/{s.required} {levelLabel(s.current)}→{levelLabel(s.required)}</span>
                    </div>
                  ))}
                </div>
                <Link to="/roadmaps" onClick={onClose} className="btn-primary mt-4 inline-flex !h-10 !px-4 !text-sm">
                  Create roadmap from these gaps →
                </Link>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}

export default function Recommendations() {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState('')
  const [drawerId, setDrawerId] = useState(null)

  const load = async () => {
    setError('')
    try {
      const docs = await getRecommendations()
      setRecommendations(docs || [])
    } catch {
      setRecommendations([])
      setError('Could not load recommendations right now. Please try again shortly.')
    }
  }

  useEffect(() => {
    load()
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      await generateRecommendations(6)
      await load()
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Recommendations are temporarily unavailable. Please try again later.',
      )
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em]">Career intelligence</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Career Recommendations</h1>
            <p className="mt-2 max-w-2xl text-lg text-ink-muted">
              Careers ranked against your skills, interests, education, assessment score, and goals.
              Scores are internal relevance estimates from your skillsaarthi profile.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={load} className="btn-secondary !h-10 !px-4 !text-sm">
              Refresh
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary !h-10 !px-4 !text-sm"
            >
              {generating ? 'Generating…' : 'Generate recommendations'}
            </button>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-accent-yellow bg-cream px-5 py-4 text-sm text-ink">
          <p>
            Keep your skills, interests, and career goals up to date — recommendations are rebuilt
            from your latest profile. You can also{' '}
            <Link to="/github" className="font-bold text-brand-deep hover:underline">
              add skills detected from your GitHub profile
            </Link>{' '}
            to improve your matches.
          </p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="card h-56 animate-pulse bg-warm" />
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="mt-8">
            <h2 className="text-2xl font-bold tracking-tight">Your matches</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {recommendations.map((recommendation) => (
                <RecommendationCard key={recommendation.$id} recommendation={recommendation} onViewGaps={setDrawerId} />
              ))}
            </div>
            {drawerId && <GapDrawer careerId={drawerId} onClose={() => setDrawerId(null)} />}
          </div>
        ) : (
          <div className="mt-8 rounded-lg border border-line bg-white px-4 py-10 text-center">
            <p className="text-lg font-bold text-ink">No recommendations yet</p>
            <p className="mx-auto mt-1 max-w-md text-sm text-ink-muted">
              Complete your profile, then click “Generate recommendations” to see your career
              matches here.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="btn-primary mt-6 !h-10 !px-4 !text-sm"
            >
              {generating ? 'Generating…' : 'Generate recommendations'}
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}