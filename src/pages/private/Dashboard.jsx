import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

const MASTERY = {
  attempted: 'bg-ink-disabled',
  familiar: 'bg-accent-blue',
  proficient: 'bg-accent-purple',
  mastered: 'bg-brand-deep',
}

const SUGGESTED_SKILLS = [
  { name: 'JavaScript', trait: 'mastered' },
  { name: 'React', trait: 'mastered' },
  { name: 'Node.js', trait: 'proficient' },
  { name: 'Express', trait: 'proficient' },
  { name: 'SQL', trait: 'familiar' },
  { name: 'REST APIs', trait: 'familiar' },
  { name: 'Docker', trait: 'attempted' },
  { name: 'System Design', trait: 'attempted' },
]

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Your dashboard</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Welcome, {user?.name || 'there'}!</h1>
        <p className="mt-2 text-lg text-ink-muted">
          Build your career readiness, one skill at a time.
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-2xl">🎯</div>
            <h3 className="mt-4 text-lg font-bold">Career Match</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Complete your profile and assessment to see your best career matches.
            </p>
            <Link to="/dashboard" className="btn-primary mt-6 !h-10 !px-4 !text-sm">
              Start assessment
            </Link>
          </div>

          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-info-soft text-2xl">🧩</div>
            <h3 className="mt-4 text-lg font-bold">Skill Gaps</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              We compare your skills against target careers to show what's missing.
            </p>
            <Link to="/dashboard" className="btn-text mt-6">
              View skill gaps →
            </Link>
          </div>

          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-warning-soft text-2xl">🗺️</div>
            <h3 className="mt-4 text-lg font-bold">Roadmap</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Generate your first personalized learning roadmap.
            </p>
            <Link to="/dashboard" className="btn-text mt-6">
              Generate roadmap →
            </Link>
          </div>
        </div>

        {/* Suggested skills / learning tree */}
        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Suggested skills</h2>
              <p className="mt-1 text-sm text-ink-muted">Mastery powers your career matches.</p>
            </div>
            <span className="rounded-full bg-cream px-4 py-2 text-sm font-bold text-amber-800">
              ⚡ Earn energy points by practicing
            </span>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {SUGGESTED_SKILLS.map((skill) => (
              <div
                key={skill.name}
                className="flex items-center gap-4 rounded-lg border border-line bg-white px-4 py-3 transition-colors hover:bg-surface-hover"
              >
                <span className={`dot ${MASTERY[skill.trait]}`} title={skill.trait} />
                <span className="flex-1 font-bold">{skill.name}</span>
                <span className="rounded-full px-3 py-1 text-xs font-bold capitalize text-ink-muted">
                  {skill.trait}
                </span>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}