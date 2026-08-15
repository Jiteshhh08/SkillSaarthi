import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { educationLevelLabel } from '../../services/profile'
import { getUserSkills } from '../../services/skills'
import { getUserInterests } from '../../services/interests'
import { getRoadmaps } from '../../services/roadmaps'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'

export default function Dashboard() {
  const { user, profile } = useAuth()
  const [skillCount, setSkillCount] = useState(0)
  const [interestCount, setInterestCount] = useState(0)
  const [roadmaps, setRoadmaps] = useState([])

  useEffect(() => {
    let mounted = true
    Promise.all([getUserSkills(user.$id), getUserInterests(user.$id), getRoadmaps()])
      .then(([skills, interests, roadmapDocs]) => {
        if (!mounted) return
        setSkillCount(skills.length)
        setInterestCount(interests.length)
        setRoadmaps(roadmapDocs || [])
      })
      .catch(() => {
        if (mounted) {
          setSkillCount(0)
          setInterestCount(0)
          setRoadmaps([])
        }
      })
    return () => {
      mounted = false
    }
  }, [user.$id])

  const currentRoadmap = roadmaps.find((roadmap) => roadmap.status !== 'completed') || roadmaps[0]

  const educationLabel = educationLevelLabel(profile?.education_level)

  const checklist = [
    {
      label: 'Education level',
      detail: educationLabel || 'Not set',
      done: Boolean(profile?.education_level),
      to: '/onboarding/education-level',
    },
    {
      label: 'Academic info',
      detail: 'Degree, subjects, strengths',
      done: Boolean(
        profile?.degree ||
          profile?.branch ||
          profile?.subjects ||
          profile?.academic_strengths ||
          profile?.experience_years > 0,
      ),
      to: '/onboarding',
    },
    {
      label: 'Skills',
      detail: `${skillCount} skill${skillCount === 1 ? '' : 's'} added`,
      done: skillCount > 0,
      to: '/onboarding',
    },
    {
      label: 'Interests',
      detail: `${interestCount} interest${interestCount === 1 ? '' : 's'} added`,
      done: interestCount > 0,
      to: '/onboarding',
    },
    {
      label: 'Career preferences',
      detail: 'Goal, industry, location',
      done: Boolean(
        profile?.career_goal ||
          profile?.preferred_industry ||
          profile?.preferred_role ||
          profile?.preferred_location ||
          profile?.work_preference,
      ),
      to: '/onboarding',
    },
    {
      label: 'Assessment',
      detail: profile?.assessment_score > 0 ? `Score ${profile.assessment_score}%` : 'Not taken',
      done: profile?.assessment_score > 0,
      to: '/assessment',
    },
  ]

  const completed = checklist.filter((item) => item.done).length
  const completion = Math.round((completed / checklist.length) * 100)

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-[0.08em]">Your dashboard</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight">Welcome, {user?.name || 'there'}!</h1>
        <p className="mt-2 text-lg text-ink-muted">
          Build your career readiness, one skill at a time.
        </p>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl bg-brand-soft px-6 py-5">
            <div className="flex items-center gap-4">
              <span className="grid h-12 w-12 place-items-center rounded-full bg-accent-purple text-xl font-black text-white">
                {(user?.name || 'U').charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-bold text-ink-muted">Education level</p>
                <p className="text-xl font-black text-ink">{educationLabel || 'Not set yet'}</p>
              </div>
            </div>
            <Link to="/onboarding/education-level" className="btn-secondary !h-10 !px-4 !text-sm">
              Change education level
            </Link>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black">Profile setup</h2>
              <span className="text-sm font-black text-brand-deep">{completion}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
              <div className="h-full rounded-full bg-brand" style={{ width: `${completion}%` }} />
            </div>
            <ul className="mt-4 space-y-2">
              {checklist.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.to}
                    className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface-hover"
                  >
                    <span className="flex items-center gap-2 font-bold text-ink">
                      <span
                        className={`grid h-5 w-5 place-items-center rounded-full text-[10px] font-black ${
                          item.done ? 'bg-brand text-white' : 'bg-line text-white'
                        }`}
                      >
                        {item.done ? '✓' : ''}
                      </span>
                      {item.label}
                    </span>
                    <span className="text-xs text-ink-muted">{item.detail}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-2xl">🎯</div>
            <h3 className="mt-4 text-lg font-bold">Career Match</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              See your best career matches, ranked by your skills, interests, and assessment.
            </p>
            <Link to="/recommendations" className="btn-primary mt-6 !h-10 !px-4 !text-sm">
              View matches
            </Link>
          </div>

          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-info-soft text-2xl">🧩</div>
            <h3 className="mt-4 text-lg font-bold">Skill Gaps</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              We compare your skills against target careers to show what's missing.
            </p>
            <Link to="/skill-gaps" className="btn-secondary mt-6 !h-10 !px-4 !text-sm">
              View skill gaps
            </Link>
          </div>

          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-warning-soft text-2xl">🗺️</div>
            <h3 className="mt-4 text-lg font-bold">Roadmap</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              {currentRoadmap
                ? `"${currentRoadmap.title}" is ${currentRoadmap.progress_percent}% complete.`
                : 'Generate your first personalized learning roadmap.'}
            </p>
            <div className="mt-6 w-full">
              <Link to="/roadmaps" className="btn-primary !h-10 !px-4 !text-sm">
                {currentRoadmap ? 'Continue roadmap' : 'Generate roadmap'}
              </Link>
            </div>
          </div>

          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-deep text-xl text-white">GH</div>
            <h3 className="mt-4 text-lg font-bold">GitHub Analysis</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Connect a public GitHub profile to surface your skills and strongest career matches.
            </p>
            <Link to="/github" className="btn-primary mt-6 !h-10 !px-4 !text-sm">
              Analyze my GitHub
            </Link>
          </div>

          <div className="card flex flex-col items-start">
            <div className="grid h-12 w-12 place-items-center rounded-full bg-accent-purple text-xl text-white">💼</div>
            <h3 className="mt-4 text-lg font-bold">Internships</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-muted">
              Find internship opportunities ranked against your profile and career goals.
            </p>
            <Link to="/internships" className="btn-secondary mt-6 !h-10 !px-4 !text-sm">
              View matches
            </Link>
          </div>
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Your skills</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {skillCount > 0
                  ? 'These power your career matches and skill-gap analysis.'
                  : 'Add skills to power your career matches.'}
              </p>
            </div>
            <Link to="/onboarding" className="btn-secondary !h-10 !px-4 !text-sm">
              Manage skills
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {skillCount === 0 ? (
              <div className="rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted sm:col-span-2">
                No skills yet — add a few from the onboarding flow to see recommendations here.
              </div>
            ) : (
              <p className="rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink-muted sm:col-span-2">
                {skillCount} skill(s) saved to your profile — generate{' '}
                <Link to="/recommendations" className="font-bold text-brand-deep hover:underline">
                  career matches
                </Link>{' '}
                or run a{' '}
                <Link to="/skill-gaps" className="font-bold text-brand-deep hover:underline">
                  skill-gap analysis
                </Link>
                .
              </p>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
