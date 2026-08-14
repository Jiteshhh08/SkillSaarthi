import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { analyzeGitHub } from '../../services/github'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function scoreTone(score) {
  if (score >= 80) return 'bg-success-soft text-success'
  if (score >= 60) return 'bg-warning-soft text-warning'
  return 'bg-danger-soft text-danger'
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-0.5 text-lg font-black text-ink">{value}</p>
    </div>
  )
}

function LanguageBar({ language, share }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="font-bold text-ink">{language}</span>
        <span className="font-bold text-ink-muted">{share}%</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-strong">
        <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, share)}%` }} />
      </div>
    </div>
  )
}

function GitHubAnalysis() {
  const { user, profile, refreshProfile } = useAuth()
  const [username, setUsername] = useState(profile?.github_username || '')
  const [applySkills, setApplySkills] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const handleAnalyze = async (event) => {
    event.preventDefault()
    const value = username.trim()
    if (!value) {
      setError('Enter a GitHub username to analyze.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await analyzeGitHub(value, { applySkills })
      setResult(data)
      if (refreshProfile) await refreshProfile(user.$id)
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          'Could not analyze that GitHub profile. Check the username and try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  const analysis = result?.analysis

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Career tools</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">GitHub analysis</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-muted">
          Connect a public GitHub profile and we translate your repos, languages, and activity
          into a technical profile with skill signals and career matches.
        </p>

        <form onSubmit={handleAnalyze} className="card mt-8">
          <label className="block text-sm font-bold text-ink" htmlFor="github-username">
            GitHub username
          </label>
          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            <input
              id="github-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="e.g. octocat"
              autoComplete="off"
              className="input-base sm:max-w-sm"
            />
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Analyzing…' : 'Analyze profile'}
            </button>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={applySkills}
              onChange={(event) => setApplySkills(event.target.checked)}
              className="h-4 w-4 rounded border-line accent-brand"
            />
            Add detected skills to my profile (feeds recommendations and internships)
          </label>
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
                Advanced analysis is temporarily unavailable, so we show basic stats derived
                from public repository data. Re-run the analysis in a bit for the full profile.
              </div>
            )}
            {result.skills_added > 0 && (
              <div className="mt-6 rounded-lg border border-success-soft bg-success-soft px-4 py-3 text-sm font-bold text-success">
                {`Added ${result.skills_added} skill(s) to your profile.`}
              </div>
            )}

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="card flex items-center gap-5">
                <img
                  src={analysis?.profile?.avatar_url}
                  alt=""
                  className="h-20 w-20 rounded-full border border-line"
                />
                <div className="min-w-0">
                  <h2 className="text-xl font-black text-ink">
                    {analysis?.profile?.name || result.username}
                  </h2>
                  <p className="truncate text-sm text-ink-muted">
                    {analysis?.profile?.bio || 'No bio on GitHub yet.'}
                  </p>
                  <a
                    href={analysis?.profile?.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-text !px-0"
                  >
                    github.com/{result.username} →
                  </a>
                </div>
              </div>

              <div className="card">
                <div className="grid grid-cols-3 gap-4">
                  <Stat label="Repos" value={analysis?.profile?.public_repos ?? 0} />
                  <Stat label="Followers" value={analysis?.profile?.followers ?? 0} />
                  <Stat label="Following" value={analysis?.profile?.following ?? 0} />
                </div>
                {analysis?.profile?.location && (
                  <p className="mt-4 text-sm text-ink-muted">{analysis.profile.location}</p>
                )}
              </div>
            </section>

            {analysis?.summary && (
              <div className="mt-6 rounded-xl border border-accent-yellow bg-cream px-6 py-5 text-ink">
                <p className="text-sm font-black uppercase tracking-wide text-amber-700">Summary</p>
                <p className="mt-1 text-lg leading-relaxed">{analysis.summary}</p>
              </div>
            )}

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="card">
                <h3 className="text-base font-black">Languages</h3>
                <div className="mt-4 space-y-4">
                  {analysis?.languages?.length ? (
                    analysis.languages.map((item) => (
                      <LanguageBar key={item.language} language={item.language} share={item.share} />
                    ))
                  ) : (
                    <p className="text-sm text-ink-muted">No language signals detected.</p>
                  )}
                </div>
              </div>

              <div className="card">
                <h3 className="text-base font-black">Skill signals</h3>
                {analysis?.skills?.length ? (
                  <ul className="mt-4 space-y-2">
                    {analysis.skills.map((signal) => (
                      <li
                        key={signal.skill}
                        className="flex items-center justify-between gap-3 rounded-md border border-line-soft bg-surface-soft px-3 py-2"
                      >
                        <span className="text-sm font-bold text-ink">{signal.skill}</span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-black ${
                            Number.isFinite(Number(signal.confidence))
                              ? scoreTone(Number(signal.confidence))
                              : 'bg-surface-strong text-ink-muted'
                          }`}
                        >
                          {signal.confidence}%
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted">No skill signals detected.</p>
                )}
                <p className="mt-3 text-xs text-ink-soft">
                  Confidence reflects how strongly your public activity signals each skill.
                </p>
              </div>
            </div>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="card">
                <h3 className="text-base font-black">Active domains</h3>
                {analysis?.domains?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {analysis.domains.map((domain) => (
                      <span
                        key={domain.domain}
                        title={domain.evidence}
                        className="chip"
                      >
                        {domain.domain}
                        <span className={`ml-2 rounded-full px-2 py-0.5 text-xs font-black ${scoreTone(domain.confidence)}`}>
                          {domain.confidence}%
                        </span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted">No domain signals detected.</p>
                )}
              </div>

              <div className="card">
                <h3 className="text-base font-black">Activity & open source</h3>
                <div className="mt-4 space-y-3 text-sm">
                  {analysis?.activity?.active_repos != null && (
                    <p className="flex items-center justify-between">
                      <span className="text-ink-muted">Active repos (6 months)</span>
                      <span className="font-black text-ink">{analysis.activity.active_repos}</span>
                    </p>
                  )}
                  {analysis?.activity?.last_push_days != null && (
                    <p className="flex items-center justify-between">
                      <span className="text-ink-muted">Last push</span>
                      <span className="font-black text-ink">
                        {analysis.activity.last_push_days === 0
                          ? 'Today'
                          : `${analysis.activity.last_push_days} days ago`}
                      </span>
                    </p>
                  )}
                  {analysis?.open_source && (
                    <p className="flex items-center justify-between">
                      <span className="text-ink-muted">Open-source activity</span>
                      <span className={`rounded-full px-2.5 py-1 text-xs font-black ${scoreTone(analysis.open_source.score)}`}>
                        {analysis.open_source.indicator}
                      </span>
                    </p>
                  )}
                </div>
                {analysis?.open_source?.evidence?.length > 0 && (
                  <ul className="mt-4 space-y-1 text-xs text-ink-soft">
                    {analysis.open_source.evidence.map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <section className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight">Recommended career matches</h2>
              {analysis?.career_matches?.length ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {analysis.career_matches.map((match) => (
                    <div key={match.career} className="card">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-ink">{match.career}</h3>
                        <span className={`rounded-full px-3 py-1 text-sm font-black ${scoreTone(match.confidence)}`}>
                          {match.confidence}%
                        </span>
                      </div>
                      <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{ width: `${match.confidence}%` }}
                        />
                      </div>
                      {match.reasons?.length > 0 && (
                        <ul className="mt-3 space-y-1 text-sm text-ink-muted">
                          {match.reasons.map((reason) => (
                            <li key={reason} className="flex items-start gap-2">
                              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                              {reason}
                            </li>
                          ))}
                        </ul>
                      )}
                      {match.skill_gaps?.length > 0 && (
                        <p className="mt-3 text-xs text-ink-soft">
                          Grow this match by learning: {match.skill_gaps.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
                  No clear career matches yet. Add more focused, topical repos and re-analyze.
                </p>
              )}
            </section>

            <section className="mt-8 grid gap-6 lg:grid-cols-2">
              <div className="card">
                <h3 className="text-base font-black">Strengths</h3>
                {analysis?.strengths?.length ? (
                  <ul className="mt-4 space-y-2">
                    {analysis.strengths.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted">Nothing to highlight yet.</p>
                )}
              </div>
              <div className="card">
                <h3 className="text-base font-black">Next steps</h3>
                {analysis?.areas_to_improve?.length ? (
                  <ul className="mt-4 space-y-2">
                    {analysis.areas_to_improve.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink">
                        <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-accent-orange" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted">
                    You are on a good track — keep shipping.
                  </p>
                )}
              </div>
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default GitHubAnalysis