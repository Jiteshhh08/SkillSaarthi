import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getInternships, getRecommendedInternships } from '../../services/internships'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

function scoreTone(score) {
  if (score >= 80) return 'bg-success-soft text-success'
  if (score >= 60) return 'bg-warning-soft text-warning'
  return 'bg-danger-soft text-danger'
}

function InternshipCard({ internship, matched }) {
  return (
    <article className="card flex flex-col">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-ink">{internship.title}</h3>
          <p className="mt-0.5 text-sm font-bold text-ink-muted">
            {internship.company}
            {internship.location ? ` · ${internship.location}` : ''}
          </p>
        </div>
        {matched && (
          <span className={`rounded-full px-3 py-1 text-sm font-black ${scoreTone(internship.match_score)}`}>
            {internship.match_score}%
          </span>
        )}
      </div>

      <p className="mt-3 text-sm leading-relaxed text-ink-muted">{internship.description}</p>

      {internship.skills?.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {internship.skills.map((skill) => (
            <span key={skill} className="chip !px-2.5 !py-0.5 !text-xs">
              {skill}
            </span>
          ))}
        </div>
      )}

      {matched && internship.reasons?.length > 0 && (
        <div className="mt-4 rounded-md bg-surface-soft px-4 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-ink-muted">Why it matches</p>
          <ul className="mt-2 space-y-1 text-sm text-ink">
            {internship.reasons.map((reason) => (
              <li key={reason} className="flex items-start gap-2">
                <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-brand" />
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {internship.eligibility && (
        <p className="mt-3 text-xs text-ink-soft">Eligibility: {internship.eligibility}</p>
      )}

      {internship.url && (
        <a
          href={internship.url}
          target="_blank"
          rel="noreferrer"
          className="btn-secondary mt-5 !h-10 !px-4 !text-sm self-start"
        >
          View opportunity
        </a>
      )}
    </article>
  )
}

function Internships() {
  const [recommendations, setRecommendations] = useState([])
  const [catalog, setCatalog] = useState([])
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [recData, catData] = await Promise.all([
        getRecommendedInternships(),
        getInternships(),
      ])
      setRecommendations(recData.recommendations || [])
      setCatalog(catData.internships || [])
    } catch {
      setRecommendations([])
      setCatalog([])
      setError('Could not load internships right now. Please try again shortly.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const filteredCatalog = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return catalog
    return catalog.filter((internship) =>
      `${internship.title} ${internship.company} ${internship.location} ${
        internship.skills?.join(' ') || ''
      } ${internship.description}`
        .toLowerCase()
        .includes(q),
    )
  }, [catalog, query])

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.08em]">Career tools</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight">Internships</h1>
            <p className="mt-2 max-w-2xl text-lg text-ink-muted">
              Internship opportunities ranked against your skills, career goals, education level,
              and location preferences.
            </p>
          </div>
          <button onClick={load} disabled={loading} className="btn-secondary !h-10 !px-4 !text-sm">
            {loading ? 'Refreshing…' : 'Refresh matches'}
          </button>
        </div>

        <div className="mt-6 rounded-xl border border-accent-yellow bg-cream px-5 py-4 text-sm text-ink">
          <p>
            These are internal relevance scores from your skillsaarthi profile — keep your skills,
            goals, and preferred location up to date for better matches. You can also{' '}
            <Link to="/github" className="font-bold text-brand-deep hover:underline">
              add skills detected from your GitHub profile
            </Link>
            .
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
        ) : (
          <>
            <section className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight">Recommended for you</h2>
              {recommendations.length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {recommendations.map((internship) => (
                    <InternshipCard key={internship.$id} internship={internship} matched />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
                  No strong matches yet. Add more skills or complete your career preferences, then
                  come back.
                </p>
              )}
            </section>

            <section className="mt-12">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Browse the catalog</h2>
                  <p className="mt-1 text-sm text-ink-muted">{catalog.length} opportunities</p>
                </div>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search by role, company, or skill…"
                  className="input-base sm:w-80"
                />
              </div>

              {filteredCatalog.length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {filteredCatalog.map((internship) => (
                    <InternshipCard key={internship.$id} internship={internship} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
                  {query ? 'No opportunities match your search.' : 'No opportunities available yet.'}
                </p>
              )}
            </section>
          </>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Internships