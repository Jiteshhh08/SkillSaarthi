import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { analyzeGitHub } from '../../services/github'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import ContributionGrid from '../../components/github/ContributionGrid'

function MetricCard({ label, value }) {
  return (
    <div className="card">
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-ink-soft">{label}</p>
      <p className="mt-2 text-2xl font-black tracking-tight text-ink">{value}</p>
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
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
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

        {error && (
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

            <section className="mt-8">
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
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

            {/* Row 1 + Row 2 from first screenshot */}
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
