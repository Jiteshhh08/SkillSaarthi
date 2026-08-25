import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { analyzeGitHub } from '../../services/github'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import ContributionGrid from '../../components/github/ContributionGrid'

const STEPS = [
  'Fetching GitHub profile',
  'Scanning repositories',
  'Analyzing programming languages',
  'Evaluating technical activity',
  'Building developer profile',
]

function MetricCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-ink">{value}</p>
    </div>
  )
}

function GithubIcon({ size = 16 }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true">
      <path d="M8 .25a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38l-.01-1.4c-2.07.45-2.5-.84-2.5-.84-.34-.86-.82-1.09-.82-1.09-.67-.46.05-.45.05-.45.74.05 1.13.76 1.13.76.66 1.13 1.74.8 2.16.61.07-.48.26-.8.47-.98-1.64-.19-3.37-.82-3.37-3.65 0-.81.29-1.47.76-1.99-.08-.19-.33-.94.07-1.96 0 0 .62-.2 2.03.76.59-.16 1.22-.24 1.85-.24.63 0 1.26.08 1.85.24 1.4-.96 2.02-.76 2.02-.76.4 1.02.15 1.77.07 1.96.47.52.76 1.18.76 1.99 0 2.84-1.73 3.46-3.38 3.64.27.23.51.68.51 1.37l-.01 2.03c0 .21.14.46.55.38A8 8 0 0 0 8 .25Z" />
    </svg>
  )
}

function WorkspaceHeader({ username }) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-white">
      <div className="flex items-center gap-2 border-b border-line bg-warm px-4 py-3 text-sm font-bold text-ink-muted">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-accent-purple text-white">
          <GithubIcon size={16} />
        </span>
        <span className="hidden sm:inline">github.com</span>
        <span className="text-ink-soft">/</span>
        <span className="text-brand-deep">{username || 'username'}</span>
        <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-line bg-white px-2.5 py-1 text-xs sm:inline-flex">
          <span className="h-2 w-2 rounded-full bg-brand" /> Analyzing
        </span>
      </div>
    </div>
  )
}

function AnalysisPipeline({ active }) {
  return (
    <div className="space-y-2.5">
      {STEPS.map((label, idx) => {
        const state = idx < active ? 'done' : idx === active ? 'active' : 'pending'
        return (
          <div
            key={label}
            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm font-bold transition-colors ${state === 'done' ? 'border-brand/30 bg-brand-soft text-brand-deep' : state === 'active' ? 'border-brand bg-brand-soft text-brand-deep shadow-sm' : 'border-line bg-white text-ink-soft'}`}
          >
            <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs ${state === 'done' ? 'bg-brand text-white' : state === 'active' ? 'bg-brand text-white animate-pulse' : 'bg-surface-strong text-ink-soft'}`}>
              {state === 'done' ? '✓' : idx + 1}
            </span>
            <span className="flex-1">{label}</span>
            {state === 'active' && <span className="h-2 w-2 animate-pulse rounded-full bg-brand" aria-hidden="true" />}
          </div>
        )
      })}
    </div>
  )
}

export default function GitHubAnalysis() {
  const { user, profile, refreshProfile } = useAuth()
  const [username, setUsername] = useState(profile?.github_username || '')
  const [applySkills, setApplySkills] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [activeStep, setActiveStep] = useState(0)
  const resultsTopRef = useRef(null)

  useEffect(() => {
    if (!loading) return
    setActiveStep(0)
    const id = setInterval(() => {
      setActiveStep((s) => Math.min(s + 1, STEPS.length - 1))
    }, 600)
    return () => clearInterval(id)
  }, [loading])

  useEffect(() => {
    if (result && resultsTopRef.current) {
      const t = setTimeout(() => {
        resultsTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 200)
      return () => clearTimeout(t)
    }
  }, [result])

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
    setActiveStep(0)
    try {
      const data = await analyzeGitHub(value, { applySkills })
      setResult(data)
      setActiveStep(STEPS.length - 1)
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
  const contributions = analysis?.contributions
  const metrics = analysis?.metrics

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Career tools</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">GitHub analysis</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-muted">
          Connect a public GitHub profile and see your development rhythm — contributions, streaks, languages, and repository activity.
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
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. octocat"
              autoComplete="off"
              className="input-base sm:max-w-sm"
            />
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50 inline-flex items-center gap-2">
              {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" aria-hidden="true" />}
              {loading ? 'Analyzing…' : 'Analyze profile'}
            </button>
          </div>
          <label className="mt-4 flex items-center gap-2 text-sm text-ink-muted">
            <input
              type="checkbox"
              checked={applySkills}
              onChange={(e) => setApplySkills(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-brand"
            />
            Add detected languages to my profile (feeds recommendations and internships)
          </label>
        </form>

        {loading && (
          <div className="mt-6 space-y-4">
            <WorkspaceHeader username={username.trim() || 'username'} />
            <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
              <div className="card">
                <h3 className="text-sm font-black tracking-wide text-ink">Analysis pipeline</h3>
                <p className="mt-1 text-xs text-ink-soft">Single API response — elegant indeterminate progress</p>
                <div className="mt-4">
                  <AnalysisPipeline active={activeStep} />
                </div>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-strong">
                  <div className="h-full w-1/3 animate-pulse rounded-full bg-brand" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="card animate-pulse">
                  <div className="h-4 w-32 rounded bg-surface-strong" />
                  <div className="mt-4 h-24 rounded bg-warm" />
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    <div className="h-20 rounded bg-warm" />
                    <div className="h-20 rounded bg-warm" />
                    <div className="h-20 rounded bg-warm" />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="card h-24 animate-pulse bg-warm" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        {result && (
          <>
            {result.skills_added > 0 && (
              <div className="mt-6 rounded-lg border border-success-soft bg-success-soft px-4 py-3 text-sm font-bold text-success">
                {`Added ${result.skills_added} skill(s) to your profile.`}
              </div>
            )}

            <div>
              <section ref={resultsTopRef} className="mt-8" style={{ scrollMarginTop: '96px' }}>
                <p className="max-w-2xl text-sm leading-relaxed text-ink-muted">
                  A live view of contribution patterns, streaks, language focus, and development rhythm across GitHub.
                </p>
              </section>

              <section className="card mt-6">
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-sm font-black uppercase tracking-wide text-ink">GitHub Activity</h3>
              </div>
              <div className="mt-4">
                <ContributionGrid
                  days={contributions?.days || []}
                  totalContributions={contributions?.totalContributions}
                />
              </div>
            </section>
            </div>
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard label="Current Streak" value={`${contributions?.currentStreak ?? 0} days`} />
              <MetricCard label="Longest Streak" value={`${contributions?.longestStreak ?? 0} days`} />
              <MetricCard
                label="Total Contributions"
                value={(contributions?.totalContributions ?? 0).toLocaleString()}
              />
              <MetricCard
                label="Average Daily Contributions"
                value={contributions?.avgDaily ?? '0.0'}
              />
              <MetricCard label="Most Active Day" value={contributions?.mostActiveDay || '—'} />
              <MetricCard label="Most Active Month" value={contributions?.mostActiveMonth || '—'} />
            </section>

            {/* Row 3 + Row 4 + Row 5 from second screenshot */}
            <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <MetricCard label="Top Languages" value={metrics?.topLanguages || '—'} />
              <MetricCard label="Public Repositories" value={metrics?.publicRepos ?? 0} />
              <MetricCard label="Private Repositories" value={metrics?.privateRepos ?? 0} />
              <MetricCard label="Followers" value={metrics?.followers ?? 0} />
              <MetricCard label="Pull Requests" value={metrics?.pullRequests ?? 0} />
              <MetricCard label="Issues Opened" value={metrics?.issuesOpened ?? 0} />
            </section>
            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              <MetricCard label="Code Reviews" value={metrics?.codeReviews ?? 0} />
            </section>

            {metrics?.languages?.length > 0 && (
              <section className="card mt-6">
                <h3 className="text-sm font-black tracking-wide text-ink">Language breakdown</h3>
                <p className="mt-1 text-xs text-ink-soft">Repository-based share by code size</p>
                <div className="mt-4 flex h-3 overflow-hidden rounded-full border border-line">
                  {metrics.languages.slice(0, 4).map((l, i) => (
                    <span key={l.language} style={{ width: `${l.share}%`, background: ['#14bf96', '#1865f2', '#f4cf3e', '#9059ff'][i % 4] }} />
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  {metrics.languages.slice(0, 4).map((l, i) => (
                    <span key={l.language} className="inline-flex items-center gap-1.5 font-bold text-ink-muted">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: ['#14bf96', '#1865f2', '#f4cf3e', '#9059ff'][i % 4] }} />
                      {l.language} {l.share}%
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Profile footer */}
            {analysis?.profile?.html_url && (
              <div className="mt-8 border-t border-line pt-6">
                <a
                  href={analysis.profile.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 border-b border-ink pb-1 text-xs font-bold uppercase tracking-[0.08em] text-ink hover:text-brand-deep"
                >
                  View GitHub Profile
                </a>
                {analysis.profile.bio && (
                  <p className="mt-3 max-w-2xl text-sm text-ink-muted">{analysis.profile.bio}</p>
                )}
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}
