import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { getUserSkills, getSkillCatalog, PROFICIENCY_LEVELS } from '../../services/skills'
import { simulateWhatIf } from '../../services/whatif'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function deltaTone(delta) {
  if (delta > 1) return 'bg-success-soft text-success'
  if (delta < -1) return 'bg-danger-soft text-danger'
  return 'bg-line text-ink-soft'
}

function ScoreBar({ score, className = 'bg-brand' }) {
  return (
    <div className="h-1.5 overflow-hidden rounded-full bg-surface-strong">
      <div className={`h-full rounded-full ${className}`} style={{ width: `${Math.min(100, score)}%` }} />
    </div>
  )
}

function ChangeRow({ career }) {
  const tone = deltaTone(career.delta)
  return (
    <li className="rounded-lg border border-line bg-white px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-ink">{career.career}</p>
          <p className="text-xs text-ink-soft">{career.category}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-black ${tone}`}>
          {career.delta > 0 ? `+${Math.round(career.delta)}` : Math.round(career.delta)}
        </span>
      </div>
      <div className="mt-3 space-y-1.5">
        <div className="flex items-center justify-between text-xs text-ink-muted">
          <span>Baseline</span>
          <span className="font-bold text-ink">{Math.round(career.baseline_score)}%</span>
        </div>
        <ScoreBar score={career.baseline_score} className="bg-ink-soft" />
        <div className="flex items-center justify-between pt-1 text-xs text-ink-muted">
          <span>Simulated</span>
          <span className="font-bold text-brand-deep">{Math.round(career.simulated_score)}%</span>
        </div>
        <ScoreBar score={career.simulated_score} className="bg-brand" />
      </div>
    </li>
  )
}

function WhatIfSimulator() {
  const { user } = useAuth()
  const [catalog, setCatalog] = useState([])
  const [changes, setChanges] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingCatalog, setLoadingCatalog] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  useEffect(() => {
    let mounted = true
    Promise.all([getSkillCatalog(), user ? getUserSkills(user.$id) : Promise.resolve([])])
      .then(([cat, ownSkills]) => {
        if (!mounted) return
        setCatalog(cat)
        const preset = ownSkills.map((entry) => ({
          name: entry.skill?.name || entry.skill_id,
          proficiency: entry.proficiency ?? 1,
        }))
        setChanges(
          preset.slice(0, 6).map((entry) => ({
            name: entry.name,
            proficiency: Math.min(5, Math.max(1, (entry.proficiency || 0) + 1)),
          })),
        )
      })
      .catch(() => {
        if (mounted) setError('Could not load the skill catalog right now.')
      })
      .finally(() => {
        if (mounted) setLoadingCatalog(false)
      })
    return () => {
      mounted = false
    }
  }, [user])

  const availableSkills = useMemo(() => {
    const used = new Set(changes.map((c) => c.name.toLowerCase().trim()))
    return catalog.filter((skill) => !used.has(skill.name.toLowerCase().trim()))
  }, [catalog, changes])

  const addChange = () => {
    setChanges((current) => [
      ...current,
      { name: availableSkills[0]?.name || '', proficiency: 3 },
    ])
  }

  const updateChange = (index, patch) => {
    setChanges((current) => current.map((entry, i) => (i === index ? { ...entry, ...patch } : entry)))
  }

  const removeChange = (index) => {
    setChanges((current) => current.filter((_, i) => i !== index))
  }

  const handleSimulate = async (event) => {
    event.preventDefault()
    const valid = changes.filter((c) => c.name)
    if (valid.length === 0) {
      setError('Add at least one skill change to simulate.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await simulateWhatIf(valid)
      setResult(data)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Could not run the simulation. Check your profile setup and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const sortedChanges = useMemo(
    () => (result?.changes || []).slice().sort((a, b) => b.delta - a.delta),
    [result],
  )
  const movers = sortedChanges.filter((c) => Math.abs(c.delta) > 1).slice(0, 10)
  const stable = sortedChanges.filter((c) => Math.abs(c.delta) <= 1)

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Career tools</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">What-If simulator</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-muted">
          Experiment safely: try hypothetical skill changes and see how your career matches would
          move. Your real profile is never changed.
        </p>

        <form onSubmit={handleSimulate} className="card mt-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-base font-black">Simulated skill changes</h2>
            <span className="text-sm text-ink-muted">
              {changes.filter((c) => c.name).length} change(s)
            </span>
          </div>

          <p className="mt-2 text-sm text-ink-muted">
            Pre-filled suggestions raise your highest-priority skills by one level. Adjust them or
            add your own — e.g. “what if I learn Python at level 4?”
          </p>

          {loadingCatalog ? (
            <p className="mt-4 text-sm text-ink-muted">Loading skills…</p>
          ) : (
            <>
              <div className="mt-4 space-y-3">
                {changes.map((entry, index) => (
                  <div
                    key={index}
                    className="grid gap-2 rounded-lg border border-line bg-surface-soft p-3 sm:grid-cols-[1fr_auto_auto] sm:items-center"
                  >
                    <select
                      value={entry.name}
                      onChange={(event) => updateChange(index, { name: event.target.value })}
                      className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-ink outline-none focus:border-brand"
                    >
                      <option value="">Pick a skill…</option>
                      {[entry, ...availableSkills]
                        .filter((skill, i, arr) => arr.findIndex((s) => s.name === skill.name) === i)
                        .sort((a, b) => a.name.localeCompare(b.name))
                        .map((skill) => (
                          <option key={skill.name} value={skill.name}>
                            {skill.name}
                          </option>
                        ))}
                    </select>

                    <select
                      value={entry.proficiency}
                      onChange={(event) => updateChange(index, { proficiency: Number(event.target.value) })}
                      className="rounded-md border border-line bg-white px-3 py-2 text-sm font-bold text-ink outline-none focus:border-brand"
                    >
                      {PROFICIENCY_LEVELS.map((level) => (
                        <option key={level.value} value={level.value}>
                          L{level.value} · {level.label}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => removeChange(index)}
                      className="rounded-md border border-danger-soft bg-danger-soft px-3 py-2 text-sm font-black text-danger transition-colors hover:bg-danger/10"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addChange}
                disabled={availableSkills.length === 0}
                className="btn-secondary mt-4 !h-10 !px-4 !text-sm"
              >
                + Add another skill
              </button>

              <button
                type="submit"
                disabled={loading || changes.filter((c) => c.name).length === 0}
                className="btn-primary mt-6 !h-11 !px-6"
              >
                {loading ? 'Simulating…' : 'Run simulation'}
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
                Advanced AI simulation is temporarily unavailable, so we show a basic skills-based
                estimate. Re-run in a bit for the full analysis.
              </div>
            )}

            {result.summary && (
              <div className="mt-6 rounded-xl border border-accent-yellow bg-cream px-6 py-5 text-ink">
                <p className="text-sm font-black uppercase tracking-wide text-amber-700">Summary</p>
                <p className="mt-1 text-lg leading-relaxed">{result.summary}</p>
              </div>
            )}

            <div className="mt-6 rounded-lg border border-line bg-info-soft px-4 py-3 text-sm text-ink">
              These are estimated recommendation scores based on your current profile — simulated
              changes are not saved to your account.
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <section className="card">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-black">Biggest movers</h2>
                  <span className="text-xs font-bold uppercase tracking-wide text-ink-soft">
                    top {movers.length}
                  </span>
                </div>
                {movers.length > 0 ? (
                  <ul className="mt-4 space-y-3">
                    {movers.map((career) => (
                      <ChangeRow key={career.career_id} career={career} />
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted">
                    None of your career scores changed by more than a point.
                  </p>
                )}
              </section>

              <section className="card">
                <h2 className="text-base font-black">Ranking shift</h2>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-ink-muted">
                      Baseline
                    </p>
                    <ol className="mt-2 space-y-1">
                      {(result.baseline || []).map((item, index) => (
                        <li key={item.career_id} className="flex items-center gap-2 text-sm">
                          <span className="w-5 text-xs font-black text-ink-soft">{index + 1}</span>
                          <span className="min-w-0 flex-1 truncate text-ink">{item.career}</span>
                          <span className="font-bold text-ink">{Math.round(item.score)}%</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-wide text-brand-deep">
                      Simulated
                    </p>
                    <ol className="mt-2 space-y-1">
                      {(result.simulated || []).map((item, index) => (
                        <li key={item.career_id} className="flex items-center gap-2 text-sm">
                          <span className="w-5 text-xs font-black text-ink-soft">{index + 1}</span>
                          <span className="min-w-0 flex-1 truncate text-ink">{item.career}</span>
                          <span className="font-bold text-brand-deep">
                            {Math.round(item.score)}%
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </section>
            </div>

            {stable.length > 0 && (
              <section className="card mt-6">
                <h2 className="text-base font-black">Unchanged</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  These careers stay effectively the same ({stable.length}):
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stable.map((career) => (
                    <span key={career.career_id} className="chip">
                      {career.career}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default WhatIfSimulator