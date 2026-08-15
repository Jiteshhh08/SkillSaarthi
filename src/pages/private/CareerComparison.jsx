import { useEffect, useState } from 'react'
import { compareCareers } from '../../services/comparison'
import { getCareers } from '../../services/careers'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function scoreTone(score) {
  if (score >= 80) return 'bg-success-soft text-success'
  if (score >= 60) return 'bg-warning-soft text-warning'
  return 'bg-danger-soft text-danger'
}

function difficultyTone(label) {
  if (label === 'High') return 'bg-danger-soft text-danger'
  if (label === 'Moderate') return 'bg-warning-soft text-warning'
  return 'bg-success-soft text-success'
}

function ScoreBar({ score }) {
  return (
    <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
      <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, score)}%` }} />
    </div>
  )
}

function CompareCard({ item, isRecommended }) {
  const details = item.skill_gap_details || []
  const strengths = item.strengths || []
  const gaps = item.skill_gaps || []
  const reasons = item.reasons || []

  return (
    <article
      className={`card flex flex-col border-2 ${
        isRecommended ? 'border-brand' : 'border-line-soft'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {isRecommended && (
              <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-black text-white">
                Best pick
              </span>
            )}
            {item.difficulty_label && (
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-black ${difficultyTone(item.difficulty_label)}`}
              >
                {item.difficulty_label} difficulty
              </span>
            )}
          </div>
          <h3 className="mt-2 text-lg font-bold text-ink">{item.career}</h3>
          <p className="mt-0.5 text-xs font-bold uppercase tracking-wide text-ink-soft">
            {item.category || 'Career'}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-sm font-black ${scoreTone(item.score)}`}>
          {Math.round(item.score)}%
        </span>
      </div>

      <ScoreBar score={item.score} />

      {item.description && (
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">{item.description}</p>
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

      {strengths.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink-soft">Your strengths</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {strengths.map((skill) => (
              <span key={skill} className="chip !border-success-soft !bg-success-soft !text-success">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {gaps.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-black uppercase tracking-wide text-ink-soft">Skills to grow</p>
          <ul className="mt-2 space-y-1 text-sm text-ink-muted">
            {gaps.slice(0, 6).map((skill) => {
              const detail = details.find((d) => d.skill === skill)
              return (
                <li key={skill} className="flex items-center justify-between gap-2">
                  <span className="flex items-start gap-2">
                    <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-orange" />
                    {skill}
                  </span>
                  {detail && (
                    <span className="text-xs text-ink-soft">
                      {detail.current}/{detail.required}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
          {gaps.length > 6 && (
            <p className="mt-2 text-xs text-ink-soft">+{gaps.length - 6} more skills to grow</p>
          )}
        </div>
      )}

      {item.next_steps?.length > 0 && (
        <div className="mt-4 rounded-md border border-line-soft bg-surface-soft px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-ink-muted">Next steps</p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {item.next_steps.slice(0, 4).map((step) => (
              <li key={step} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand-deep" />
                {step}
              </li>
            ))}
          </ul>
        </div>
      )}

      {item.difficulty != null && (
        <p className="mt-4 flex items-center justify-between text-xs text-ink-soft">
          <span>Difficulty</span>
          <span className="font-black">{item.difficulty}/100</span>
        </p>
      )}
    </article>
  )
}

function CareerComparison() {
  const [careers, setCareers] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCareers, setLoadingCareers] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    let mounted = true
    getCareers()
      .then((list) => {
        if (!mounted) return
        setCareers(list)
      })
      .catch(() => {
        if (!mounted) return
        setError('Could not load the career catalog right now.')
      })
      .finally(() => {
        if (mounted) setLoadingCareers(false)
      })
    return () => {
      mounted = false
    }
  }, [])

  const toggle = (careerId) => {
    setSelected((current) =>
      current.includes(careerId)
        ? current.filter((id) => id !== careerId)
        : [...current, careerId],
    )
  }

  const handleCompare = async (event) => {
    event.preventDefault()
    if (selected.length < 2) {
      setError('Select at least two careers to compare.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await compareCareers(selected)
      setResult(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Could not compare those careers. Check your profile setup and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Career tools</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Career comparison</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-muted">
          Pick two or more careers and see them side by side — match score, difficulty, and the
          exact skills each one would ask you to grow.
        </p>

        <form onSubmit={handleCompare} className="card mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black">Careers to compare</h2>
            <span className="text-sm text-ink-muted">
              {selected.length} selected{selected.length >= 2 ? ' ✓' : ' · need ≥ 2'}
            </span>
          </div>

          {loadingCareers ? (
            <p className="mt-4 text-sm text-ink-muted">Loading careers…</p>
          ) : (
            <>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {careers.map((career) => {
                  const active = selected.includes(career.$id)
                  return (
                    <label
                      key={career.$id}
                      className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-sm font-bold transition-colors ${
                        active
                          ? 'border-brand bg-brand-soft text-brand-deep'
                          : 'border-line bg-white text-ink hover:bg-surface-hover'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={active}
                        onChange={() => toggle(career.$id)}
                        className="h-4 w-4 rounded border-line accent-brand"
                      />
                      <span className="min-w-0">
                        <span className="block truncate">{career.name}</span>
                        <span className="block text-xs font-medium text-ink-soft">
                          {career.category}
                        </span>
                      </span>
                    </label>
                  )
                })}
              </div>
              <button
                type="submit"
                disabled={loading || selected.length < 2}
                className="btn-primary mt-6 !h-11 !px-6"
              >
                {loading ? 'Comparing…' : 'Compare careers'}
              </button>
            </>
          )}
        </form>

        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        {result && (
          <>
            {result.source === 'fallback' && (
              <div className="mt-6 rounded-lg border border-line bg-info-soft px-4 py-3 text-sm text-ink">
                Advanced AI comparison is temporarily unavailable, so we show a basic skills-based
                comparison. Re-run in a bit for the full analysis.
              </div>
            )}

            {result.summary && (
              <div className="mt-6 rounded-xl border border-accent-yellow bg-cream px-6 py-5 text-ink">
                <p className="text-sm font-black uppercase tracking-wide text-amber-700">Summary</p>
                <p className="mt-1 text-lg leading-relaxed">{result.summary}</p>
              </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {(result.careers || []).map((item) => (
                <CompareCard
                  key={item.career_id}
                  item={item}
                  isRecommended={item.career_id === result.recommended_id}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default CareerComparison