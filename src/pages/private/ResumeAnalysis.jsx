import { useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { analyzeResume, errorMessage } from '../../services/resume'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

const ACCEPTED = '.pdf,.doc,.docx'

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

export default function ResumeAnalysis() {
  const { user, refreshProfile } = useAuth()
  const [file, setFile] = useState(null)
  const [applySkills, setApplySkills] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (event) => {
    const selected = event.target.files?.[0] || null
    if (selected && event.type === 'change') event.target.value = ''
    setFile(selected)
    setResult(null)
    setError('')
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setDragging(true)
  }

  const handleDragLeave = (event) => {
    event.preventDefault()
    setDragging(false)
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setDragging(false)
    const dropped = event.dataTransfer.files?.[0] || null
    if (!dropped) return
    const ext = dropped.name.split('.').pop()?.toLowerCase()
    if (dropped.type.startsWith('image/') || !['pdf', 'doc', 'docx'].includes(ext)) {
      setError('Only PDF, DOC, or DOCX files are accepted.')
      return
    }
    setFile(dropped)
    setResult(null)
    setError('')
  }

  const handleAnalyze = async (event) => {
    event.preventDefault()
    if (!file) {
      setError('Choose a resume to analyze.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const data = await analyzeResume(file, { applySkills })
      setResult(data)
      if (refreshProfile) await refreshProfile(user.$id)
    } catch (err) {
      setError(errorMessage(err))
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
        <h1 className="mt-2 text-3xl font-black tracking-tight">Resume analysis</h1>
        <p className="mt-2 max-w-2xl text-lg text-ink-muted">
          Upload your resume and we extract your skills, experience, strengths, and best career
          matches to guide your next step.
        </p>

        <form onSubmit={handleAnalyze} className="card mt-8">
          <div
            role="button"
            tabIndex={0}
            onClick={() => inputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') inputRef.current?.click()
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              dragging ? 'border-brand bg-brand-soft' : 'border-line bg-surface-soft hover:border-brand'
            }`}
          >
            <p className="text-3xl">{dragging ? '📥' : '📄'}</p>
            <p className="mt-2 text-sm font-bold text-ink">
              {file ? file.name : 'Drag & drop your resume here'}
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {file
                ? `${(file.size / 1024).toFixed(0)} KB — click to choose another`
                : 'or click to browse · PDF, DOC, DOCX up to 5 MB'}
            </p>
            <input
              ref={inputRef}
              id="resume-file"
              type="file"
              accept={ACCEPTED}
              onChange={handleFile}
              className="sr-only"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button type="submit" disabled={loading} className="btn-primary disabled:opacity-50">
              {loading ? 'Analyzing…' : 'Analyze resume'}
            </button>
            {file && !loading && (
              <button
                type="button"
                onClick={() => {
                  setFile(null)
                  setResult(null)
                  setError('')
                }}
                className="text-sm font-bold text-ink-muted hover:text-danger"
              >
                Remove file
              </button>
            )}
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
                Advanced analysis is temporarily unavailable, so we show a basic read from your
                resume. Re-run in a bit for the full profile.
              </div>
            )}
            {result.skills_added > 0 && (
              <div className="mt-6 rounded-lg border border-success-soft bg-success-soft px-4 py-3 text-sm font-bold text-success">
                {`Added ${result.skills_added} skill(s) to your profile.`}
              </div>
            )}

            <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
              <div className="card flex items-center gap-5">
                <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand-soft text-2xl">
                  📄
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-black text-ink">
                    {result.analysis_id && result.file_name
                      ? result.file_name
                      : 'Your resume'}
                  </h2>
                  <p className="text-sm text-ink-muted">
                    {analysis?.education && analysis.education !== 'not specified'
                      ? analysis.education.toUpperCase()
                      : 'Education not specified'}
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="grid grid-cols-2 gap-4">
                  <Stat label="Skills" value={analysis?.skills?.length ?? 0} />
                  <Stat label="Years exp." value={analysis?.experience_years ?? 0} />
                </div>
                {analysis?.contact?.email && (
                  <p className="mt-4 truncate text-sm text-ink-muted">{analysis.contact.email}</p>
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
                <h3 className="text-base font-black">Detected skills</h3>
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
                  <p className="mt-4 text-sm text-ink-muted">
                    No skills detected. Ensure your resume has a clear skills section.
                  </p>
                )}
                <p className="mt-3 text-xs text-ink-soft">
                  Confidence reflects how clearly each skill appears in your resume.
                </p>
              </div>

              <div className="card">
                <h3 className="text-base font-black">Projects</h3>
                {analysis?.projects?.length ? (
                  <ul className="mt-4 space-y-2">
                    {analysis.projects.map((project, index) => (
                      <li
                        key={`${project}-${index}`}
                        className="flex items-start gap-2 text-sm text-ink"
                      >
                        <span className="mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                        {project}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-4 text-sm text-ink-muted">
                    No projects detected. Mention what you have built.
                  </p>
                )}
              </div>
            </div>

            <section className="mt-8">
              <h2 className="text-2xl font-bold tracking-tight">Recommended career matches</h2>
              {analysis?.career_matches?.length ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {analysis.career_matches.map((match) => (
                    <div key={match.career} className="card">
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-bold text-ink">{match.career}</h3>
                        <span
                          className={`rounded-full px-3 py-1 text-sm font-black ${scoreTone(match.confidence)}`}
                        >
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
                          Grow this match by highlighting or learning: {match.skill_gaps.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
                  No clear career matches yet. Add a clear skills section with the relevant keywords
                  and re-analyze.
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
                    You are on a good track — keep building.
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
