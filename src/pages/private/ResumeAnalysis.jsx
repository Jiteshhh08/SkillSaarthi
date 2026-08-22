import { useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import {
  analyzeResumePipeline,
  downloadLatex,
  downloadPdf,
  errorMessage,
  extractResume,
  generateResume,
  matchResume,
  optimizeResume,
} from '../../services/resume'
import ResumeEditor from '../../components/resume/ResumeEditor'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import Icon from '../../components/common/Icon'
import DecorativeShapes from '../../components/common/DecorativeShapes'
import ResumeSkeleton from '../../components/common/ResumeSkeleton'

const ACCEPTED = '.pdf,.doc,.docx'

const STEPS = ['Extract', 'Analyze', 'Match', 'Optimize', 'Generate']

function scoreTone(score) {
  if (score >= 80) return 'bg-success-soft text-success'
  if (score >= 60) return 'bg-warning-soft text-warning'
  return 'bg-danger-soft text-danger'
}

function ScoreBar({ label, score, weight, detail }) {
  const clamped = Math.max(0, Math.min(100, Number(score) || 0))
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-bold text-ink capitalize">{label}</p>
        <div className="flex items-center gap-2">
          {weight != null && <span className="text-xs text-ink-soft">{weight}% weight</span>}
          <span className={`text-sm font-black ${scoreTone(clamped)}`}>{clamped}%</span>
        </div>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-strong">
        <div className={`h-full rounded-full ${scoreTone(clamped)}`} style={{ width: `${clamped}%` }} />
      </div>
      {detail && <p className="mt-1 text-xs text-ink-soft">{detail}</p>}
    </div>
  )
}

function MiniList({ title, items, dotClass = 'bg-brand' }) {
  if (!items?.length) return null
  return (
    <div className="card">
      <h3 className="text-base font-black">{title}</h3>
      <ul className="mt-4 space-y-2">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm text-ink">
            <span className={`mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function SkillChip({ name, note, tone }) {
  return (
    <span className="flex flex-col gap-0.5 rounded-md border border-line bg-surface-soft px-3 py-1.5 text-sm font-bold text-ink">
      {name}
      {note && <span className={`text-xs font-medium ${tone}`}>{note}</span>}
    </span>
  )
}

function LevelPill({ level }) {
  const tones = {
    strong: 'bg-success-soft text-success',
    partial: 'bg-warning-soft text-warning',
    weak: 'bg-danger-soft text-danger',
    none: 'bg-surface-strong text-ink-muted',
  }
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-black capitalize ${tones[level] || tones.none}`}>
      {level}
    </span>
  )
}

function JobMatchCard({ title, result }) {
  if (!result) return null
  return (
    <div className="card">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-base font-black">{title}</h3>
        <div className="flex items-center gap-2">
          <LevelPill level={result.level} />
          <span className="text-sm font-black">{result.score}%</span>
        </div>
      </div>
      {result.analysis && <p className="mt-2 text-sm text-ink">{result.analysis}</p>}
    </div>
  )
}

export default function ResumeAnalysis() {
  const { user, refreshProfile } = useAuth()
  const [file, setFile] = useState(null)
  const [applySkills, setApplySkills] = useState(false)
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef(null)

  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')

  const [analysisId, setAnalysisId] = useState('')
  const [fileName, setFileName] = useState('')
  const [resumeJson, setResumeJson] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [jobMatch, setJobMatch] = useState(null)
  const [optimizedJson, setOptimizedJson] = useState(null)
  const [generated, setGenerated] = useState(null)

  const currentStep = !analysisId ? 0 : !analysis ? 1 : !jobMatch ? 2 : !optimizedJson ? 3 : 4

  const run = async (label, fn) => {
    setBusy(label)
    setError('')
    try {
      return await fn()
    } catch (err) {
      setError(errorMessage(err))
      return null
    } finally {
      setBusy('')
    }
  }

  const handleFile = (event) => {
    const selected = event.target.files?.[0] || null
    if (selected && event.type === 'change') event.target.value = ''
    setFile(selected)
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
    setError('')
  }

  const reset = () => {
    setFile(null)
    setApplySkills(false)
    setAnalysisId('')
    setFileName('')
    setResumeJson(null)
    setAnalysis(null)
    setJobDescription('')
    setJobMatch(null)
    setOptimizedJson(null)
    setGenerated(null)
    setError('')
  }

  const handleExtract = async (event) => {
    event?.preventDefault()
    if (!file) {
      setError('Choose a resume to extract.')
      return
    }
    const data = await run('Extracting…', () => extractResume(file, { applySkills }))
    if (!data) return
    setAnalysisId(data.analysis_id)
    setFileName(data.file_name || file.name)
    setResumeJson(data.resume_json)
    setAnalysis(null)
    setJobMatch(null)
    setOptimizedJson(null)
    setGenerated(null)
    if (refreshProfile) await refreshProfile(user.$id)
  }

  const handleAnalyze = async () => {
    const data = await run('Analyzing…', () =>
      analyzeResumePipeline(analysisId, jobDescription, resumeJson),
    )
    if (!data) return
    setAnalysis(data.analysis)
    setJobMatch(null)
    setOptimizedJson(null)
    setGenerated(null)
  }

  const handleMatch = async () => {
    if (!jobDescription.trim()) {
      setError('Paste a job description to match against.')
      return
    }
    const data = await run('Matching…', () => matchResume(analysisId, jobDescription, resumeJson))
    if (!data) return
    setJobMatch(data.job_match)
    setOptimizedJson(null)
    setGenerated(null)
  }

  const handleOptimize = async () => {
    const data = await run('Optimizing…', () =>
      optimizeResume(analysisId, jobDescription, resumeJson),
    )
    if (!data) return
    setOptimizedJson(data.optimized_resume_json)
    setGenerated(null)
  }

  const handleGenerate = async () => {
    const source = optimizedJson || resumeJson
    const data = await run('Generating LaTeX…', () => generateResume(analysisId, source, true))
    if (!data) return
    setGenerated(data)
  }

  const handleDownloadLatex = async () => {
    await run('Downloading…', () => downloadLatex(analysisId, `resume-${fileName || analysisId}.tex`))
  }

  const handleDownloadPdf = async () => {
    await run('Downloading…', () => downloadPdf(analysisId, `resume-${fileName || analysisId}.pdf`))
  }

  const sectionScores = analysis?.section_scores || {}
  const sectionOrder = ['skills', 'experience', 'projects', 'education', 'contact', 'summary', 'ats']

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Career tools</p>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight">Resume analysis</h1>
            <p className="mt-2 max-w-2xl text-lg text-ink-muted">
              Upload your resume to extract a structured profile, then analyze it, match it to a job,
              and generate a clean ATS-friendly LaTeX resume.
            </p>
          </div>
          {analysisId && (
            <button type="button" onClick={reset} className="btn-secondary">
              Start over
            </button>
          )}
        </div>

        <nav className="mt-8 flex flex-wrap gap-2">
          {STEPS.map((label, index) => {
            const done = index < currentStep
            const active = index === currentStep
            return (
              <span
                key={label}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
                  active
                    ? 'bg-brand text-white'
                    : done
                      ? 'bg-brand-soft text-brand-deep'
                      : 'bg-surface-soft text-ink-muted'
                }`}
              >
                <span className="grid h-5 w-5 place-items-center rounded-full text-xs">
                  {done ? <Icon name="shield-check" size={14} /> : index + 1}
                </span>
                {label}
              </span>
            )
          })}
        </nav>

        {error && (
          <div className="mt-6 rounded-lg border border-danger-soft bg-danger-soft px-4 py-3 text-sm font-bold text-danger">
            {error}
          </div>
        )}

        {!analysisId && (
          <form onSubmit={handleExtract} className="card mt-8">
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
              <p className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-brand-soft">
                <Icon
                  name={dragging ? 'download' : 'file-text'}
                  size={26}
                  className="text-brand-deep"
                />
              </p>
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
              <button type="submit" disabled={!!busy} className="btn-primary disabled:opacity-50">
                {busy ? 'Extracting…' : 'Extract & structure my resume'}
              </button>
              {file && !busy && (
                <button
                  type="button"
                  onClick={() => setFile(null)}
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
        )}

        {resumeJson && (
          <section className="mt-8">
            <div className="card relative flex items-center gap-5 overflow-hidden">
              <DecorativeShapes variant="card" index={5} />
              <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand-soft">
                <Icon name="file-text" size={30} className="text-brand-deep" />
              </span>
              <div className="min-w-0">
                <h2 className="truncate text-xl font-black text-ink">{fileName || 'Your resume'}</h2>
                <p className="text-sm text-ink-muted">
                  Structured profile from {currentStep === 0 ? 'your upload' : 'the extraction step'} —
                  edit anything below before the next step.
                </p>
              </div>
            </div>

            <div className="card mt-6">
              <p className="text-sm font-black uppercase tracking-wide text-ink-muted">
                Structured resume data
              </p>
              <div className="mt-4">
                <ResumeEditor resume={resumeJson} onChange={setResumeJson} disabled={!!busy} />
              </div>
              <div className="mt-6 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!!busy}
                  className="btn-primary disabled:opacity-50"
                >
                  {busy ? 'Analyzing…' : 'Analyze resume'}
                </button>
                <p className="mt-2 text-xs text-ink-soft">
                  AI reviews section quality and gaps; scoring is computed locally from your data.
                </p>
              </div>
            </div>
          </section>
        )}

        {analysis && (
          <section className="mt-8 space-y-6">
            <div className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Resume analysis</h2>
                  <p className="text-sm text-ink-muted">
                    Overall score combined from each weighted section.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-2xl px-5 py-2 text-2xl font-black ${scoreTone(analysis.overall_score)}`}>
                    {Math.round(analysis.overall_score)}%
                  </span>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {sectionOrder.map((key) => {
                  const entry = sectionScores[key]
                  if (!entry) return null
                  return (
                    <ScoreBar
                      key={key}
                      label={key}
                      score={entry.score}
                      weight={entry.weight}
                      detail={(entry.reason || []).join(' · ') || null}
                    />
                  )
                })}
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <MiniList title="Strengths" items={analysis.strengths} dotClass="bg-brand" />
              <MiniList title="Things to improve" items={analysis.weaknesses} dotClass="bg-accent-orange" />
            </div>

            {analysis.missing_sections?.length > 0 && (
              <div className="rounded-lg border border-warning-soft bg-warning-soft px-4 py-3">
                <p className="text-sm font-black uppercase tracking-wide text-warning">Missing sections</p>
                <p className="mt-1 text-sm text-ink">{analysis.missing_sections.join(' · ')}</p>
              </div>
            )}

            {analysis.ats_issues?.length > 0 && (
              <div className="rounded-lg border border-danger-soft bg-danger-soft px-4 py-3">
                <p className="text-sm font-black uppercase tracking-wide text-danger">
                  ATS parsing issues
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {analysis.ats_issues.map((issue) => (
                    <li key={issue} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-danger" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.section_scores?.ats?.issues?.length > 0 && (
              <div className="rounded-lg border border-warning-soft bg-warning-soft px-4 py-3">
                <p className="text-sm font-black uppercase tracking-wide text-warning">
                  ATS content check
                </p>
                <ul className="mt-2 space-y-1 text-sm text-ink">
                  {analysis.section_scores.ats.issues.map((issue) => (
                    <li key={issue} className="flex items-start gap-2">
                      <span className="mt-1.5 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <MiniList title="Recommended next steps" items={analysis.recommendations} dotClass="bg-brand" />
            <MiniList title="Explainer notes" items={analysis.evidence} dotClass="bg-ink-soft" />

            <div className="card">
              <h3 className="text-base font-black">Match to a job description</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Paste the job description you are targeting to see how your profile lines up.
              </p>
              <textarea
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                rows={6}
                disabled={!!busy}
                placeholder="Paste a job description here…"
                className="input-base mt-3 h-auto py-2"
              />
              <button
                type="button"
                onClick={handleMatch}
                disabled={!!busy || !jobDescription.trim()}
                className="btn-primary mt-4 disabled:opacity-50"
              >
                {busy ? 'Matching…' : 'Score my match'}
              </button>
            </div>
          </section>
        )}

        {jobMatch && (
          <section className="mt-8 space-y-6">
            <div className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Job match</h2>
                  <p className="text-sm text-ink-muted">
                    Weighted score: skills 60% · experience 20% · education 10% · projects 10%.
                  </p>
                </div>
                <span className={`rounded-2xl px-5 py-2 text-2xl font-black ${scoreTone(jobMatch.match_score)}`}>
                  {Math.round(jobMatch.match_score)}%
                </span>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <div className="card">
                  <h3 className="text-base font-black text-success">Matched skills</h3>
                  {jobMatch.matched_skills?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {jobMatch.matched_skills.map((skill) => (
                        <span key={skill.name} className="chip">
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-ink-muted">None clearly matched.</p>
                  )}
                </div>
                <div className="card">
                  <h3 className="text-base font-black text-warning">Related skills</h3>
                  {jobMatch.related_skills?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {jobMatch.related_skills.map((skill) => (
                        <SkillChip key={skill.name} name={skill.name} note={skill.how} tone="text-warning" />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-ink-muted">No related skills flagged.</p>
                  )}
                </div>
                <div className="card">
                  <h3 className="text-base font-black text-danger">Missing skills</h3>
                  {jobMatch.missing_skills?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {jobMatch.missing_skills.map((skill) => (
                        <SkillChip key={skill.name} name={skill.name} note={skill.why} tone="text-danger" />
                      ))}
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-ink-muted">Nothing critical missing.</p>
                  )}
                </div>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-3">
                <JobMatchCard title="Experience match" result={jobMatch.experience_match} />
                <JobMatchCard title="Education match" result={jobMatch.education_match} />
                <JobMatchCard title="Project match" result={jobMatch.project_match} />
              </div>
            </div>

            <MiniList title="How to strengthen this match" items={jobMatch.recommendations} dotClass="bg-brand" />
            <MiniList title="Match notes" items={jobMatch.evidence} dotClass="bg-ink-soft" />

            <div className="card">
              <h3 className="text-base font-black">Next: optimize wording</h3>
              <p className="mt-1 text-sm text-ink-muted">
                Tailor bullet phrasing toward this role without inventing any facts.
              </p>
              <button
                type="button"
                onClick={handleOptimize}
                disabled={!!busy}
                className="btn-primary mt-4 disabled:opacity-50"
              >
                {busy ? 'Optimizing…' : 'Optimize my resume'}
              </button>
            </div>
          </section>
        )}

        {optimizedJson && (
          <section className="mt-8 space-y-6">
            <div className="card">
              <h2 className="text-2xl font-black tracking-tight">Optimized resume</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Improved wording toward the job. Review and edit, then generate the LaTeX resume.
              </p>
              <div className="mt-4">
                <ResumeEditor resume={optimizedJson} onChange={setOptimizedJson} disabled={!!busy} />
              </div>
              <div className="mt-6 border-t border-line pt-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!!busy}
                  className="btn-primary disabled:opacity-50"
                >
                  {busy ? 'Generating…' : 'Generate LaTeX & PDF'}
                </button>
                <p className="mt-2 text-xs text-ink-soft">
                  LaTeX rendering is deterministic; if no PDF compiler is installed locally you will
                  still get the .tex file and a clear message.
                </p>
              </div>
            </div>
          </section>
        )}

        {generated && (
          <section className="mt-8 space-y-6">
            <div className="card">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black tracking-tight">Your generated resume</h2>
                  <p className="text-sm text-ink-muted">
                    Clean single-column, ATS-friendly LaTeX (Jake template).
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleDownloadLatex}
                    disabled={!!busy}
                    className="btn-secondary disabled:opacity-50"
                  >
                    <Icon name="download" size={18} className="mr-1" />
                    Download .tex
                  </button>
                  {generated.compiled && generated.pdf_file_id ? (
                    <button
                      type="button"
                      onClick={handleDownloadPdf}
                      disabled={!!busy}
                      className="btn-primary disabled:opacity-50"
                    >
                      <Icon name="download" size={18} className="mr-1" />
                      Download PDF
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-2xl border border-line bg-surface-soft px-4 py-3 text-sm font-bold text-ink-muted">
                      PDF compiler not found on the server
                    </span>
                  )}
                </div>
              </div>

              {generated.compiled && (
                <div className="mt-4 rounded-lg border border-success-soft bg-success-soft px-4 py-3 text-sm font-bold text-success">
                  Compiled with {generated.compiler}. Your PDF is ready to download.
                </div>
              )}
              {generated.error && (
                <div className="mt-4 rounded-lg border border-warning-soft bg-warning-soft px-4 py-3 text-sm text-ink">
                  <p className="text-sm font-black uppercase tracking-wide text-warning">
                    PDF not generated
                  </p>
                  <p className="mt-1">{generated.error}</p>
                  {generated.log && (
                    <pre className="mt-2 max-h-40 overflow-auto rounded-md bg-white p-3 text-xs text-ink-soft">
                      {generated.log}
                    </pre>
                  )}
                </div>
              )}

              <div className="mt-6">
                <p className="text-sm font-black uppercase tracking-wide text-ink-muted">
                  LaTeX source (review, then compile locally if you prefer)
                </p>
                <pre className="mt-2 max-h-96 overflow-auto rounded-md border border-line bg-surface-soft p-4 text-xs leading-relaxed text-ink">
                  {generated.latex}
                </pre>
              </div>
            </div>
          </section>
        )}

        {busy && <ResumeSkeleton phase={busy} />}
      </main>

      <Footer />
    </div>
  )
}