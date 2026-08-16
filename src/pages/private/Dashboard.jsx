import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { educationLevelLabel } from '../../services/profile'
import { getUserSkills } from '../../services/skills'
import { getUserInterests } from '../../services/interests'
import { getRoadmaps } from '../../services/roadmaps'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import Icon from '../../components/common/Icon'
import DecorativeShapes from '../../components/common/DecorativeShapes'

const TOOL_CARDS = [
  {
    icon: 'target',
    title: 'Career Match',
    description: 'See your best career fits, ranked by your profile.',
    to: '/recommendations',
    cta: 'View matches',
    tile: 'bg-brand-soft',
    iconClass: 'text-brand-deep',
  },
  {
    icon: 'puzzle',
    title: 'Skill Gaps',
    description: 'Find out which skills to learn next for your dream career.',
    to: '/skill-gaps',
    cta: 'View skill gaps',
    tile: 'bg-info-soft',
    iconClass: 'text-info',
  },
  {
    icon: 'map',
    title: 'Roadmap',
    description: 'Follow an ordered learning plan toward your goal.',
    to: '/roadmaps',
    cta: 'Open roadmap',
    tile: 'bg-warning-soft',
    iconClass: 'text-warning',
  },
  {
    icon: 'github',
    title: 'GitHub Analysis',
    description: 'Turn your code into a career profile in seconds.',
    to: '/github',
    cta: 'Analyze GitHub',
    tile: 'bg-deep',
    iconClass: 'text-white',
  },
  {
    icon: 'file-text',
    title: 'Resume Analysis',
    description: 'Upload a resume to surface skills and best matches.',
    to: '/resume',
    cta: 'Analyze resume',
    tile: 'bg-brand-soft',
    iconClass: 'text-brand-deep',
  },
  {
    icon: 'scale',
    title: 'Career Compare',
    description: 'Weigh careers side by side to find your best fit.',
    to: '/career-compare',
    cta: 'Compare careers',
    tile: 'bg-info-soft',
    iconClass: 'text-info',
  },
  {
    icon: 'sparkles',
    title: 'What-If Simulator',
    description: 'Experiment with skills and see matches move — safely.',
    to: '/what-if',
    cta: 'Run simulation',
    tile: 'bg-accent-purple',
    iconClass: 'text-white',
  },
  {
    icon: 'briefcase',
    title: 'Internships',
    description: 'Discover opportunities ranked just for you.',
    to: '/internships',
    cta: 'View matches',
    tile: 'bg-brand-deep',
    iconClass: 'text-white',
  },
]

function StatCard({ icon, label, value, sub, loading, index = 0 }) {
  return (
    <div className="card relative overflow-hidden">
      <DecorativeShapes variant="card" index={index} />
      {loading ? (
        <div className="h-6 w-24 animate-pulse rounded-md bg-surface-soft" />
      ) : (
        <div className="relative">
          <div className="absolute -right-4 -top-4 grid h-16 w-16 place-items-center rounded-full bg-surface-soft">
            <Icon name={icon} size={26} className="text-brand-deep" />
          </div>
          <p className="text-3xl font-black tracking-tight text-ink">{value}</p>
          <p className="mt-1 text-sm font-bold text-ink-muted">{label}</p>
          {sub && <p className="mt-1 text-xs text-ink-soft">{sub}</p>}
        </div>
      )}
    </div>
  )
}

export default function Dashboard() {
  const { user, profile, streak } = useAuth()
  const [skills, setSkills] = useState([])
  const [interests, setInterests] = useState([])
  const [roadmaps, setRoadmaps] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    Promise.all([getUserSkills(user.$id), getUserInterests(user.$id), getRoadmaps()])
      .then(([skillsData, interestsData, roadmapDocs]) => {
        if (!mounted) return
        setSkills(skillsData)
        setInterests(interestsData)
        setRoadmaps(roadmapDocs || [])
      })
      .catch(() => {
        if (mounted) {
          setSkills([])
          setInterests([])
          setRoadmaps([])
        }
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })
    return () => {
      mounted = false
    }
  }, [user.$id])

  const skillCount = skills.length
  const interestCount = interests.length
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
  const nextSteps = checklist.filter((item) => !item.done).slice(0, 3)

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-7xl px-6 py-10">
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-soft via-white to-warm px-8 py-10 shadow-card-rest">
          <div className="absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand/10" />
          <div className="absolute right-16 top-8 h-20 w-20 rounded-full bg-accent-yellow/20" />
          <div className="relative">
            <p className="text-sm font-bold uppercase tracking-[0.08em] text-brand-deep">
              Your dashboard
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Welcome back, {(user?.name || 'there').split(' ')[0]}
            </h1>
            <p className="mt-2 max-w-2xl text-lg text-ink-muted">
              {loading ? (
                <>
                  <span className="inline-block h-5 w-64 animate-pulse rounded bg-surface-soft" />
                  <span className="mt-1.5 block h-5 w-44 animate-pulse rounded bg-surface-soft" />
                </>
              ) : completion === 100 ? (
                'Your profile is fully set up — keep the momentum going.'
              ) : (
                `Your profile is ${completion}% complete. A few quick steps to unlock everything.`
              )}
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-deep bg-white px-3 py-1.5 text-sm font-bold text-brand-deep">
                <Icon name="flame" size={16} className="text-accent-orange" />
                {streak.current} day{streak.current === 1 ? '' : 's'} streak
              </span>
              {educationLabel && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-bold text-ink">
                  <Icon name="graduation-cap" size={16} className="text-brand-deep" />
                  {educationLabel}
                </span>
              )}
              {profile?.assessment_score > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5 text-sm font-bold text-ink">
                  <Icon name="chart" size={16} className="text-brand-deep" />
                  Assessment {profile.assessment_score}%
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon="target"
            label="Profile setup"
            value={`${completion}%`}
            sub={`${completed} of ${checklist.length} steps`}
            loading={false}
            index={1}
          />
          <StatCard
            icon="wrench"
            label="Skills added"
            value={skillCount}
            sub="powering your matches"
            loading={loading}
            index={4}
          />
          <StatCard
            icon="lightbulb"
            label="Interests"
            value={interestCount}
            sub="helping us rank careers"
            loading={loading}
            index={7}
          />
          <StatCard
            icon="flame"
            label="Best streak"
            value={`${streak.best} days`}
            sub={streak.current > 0 ? `currently on ${streak.current}` : 'start today'}
            loading={false}
            index={9}
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="card relative overflow-hidden lg:col-span-2">
            <DecorativeShapes variant="card" index={2} />
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black">Profile setup</h2>
              <span className="text-sm font-black text-brand-deep">
                {loading ? '…' : `${completion}%`}
              </span>
            </div>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="h-8 animate-pulse rounded-md bg-surface-soft" />
                ))}
              </div>
            ) : (
              <>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand to-brand-deep transition-all"
                    style={{ width: `${completion}%` }}
                  />
                </div>
                <ul className="mt-4 space-y-1.5">
                  {checklist.map((item) => (
                    <li key={item.label}>
                      <Link
                        to={item.to}
                        className="flex items-center justify-between gap-2 rounded-md px-2 py-2 transition-colors hover:bg-surface-hover"
                      >
                        <span className="flex items-center gap-2.5 font-bold text-ink">
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                              item.done ? 'bg-brand text-white' : 'bg-line text-white'
                            }`}
                          >
                            {item.done ? '✓' : ''}
                          </span>
                          {item.label}
                        </span>
                        {loading &&
                        (item.label === 'Skills' || item.label === 'Interests') ? (
                          <span className="h-3.5 w-20 animate-pulse rounded bg-surface-soft" />
                        ) : (
                          <span className="text-xs text-ink-muted">{item.detail}</span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="card relative flex flex-col overflow-hidden">
            <DecorativeShapes variant="card" index={6} />
            <h2 className="text-base font-black">Suggested next</h2>
            {loading ? (
              <div className="mt-4 space-y-3">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="h-20 animate-pulse rounded-lg bg-surface-soft" />
                ))}
              </div>
            ) : nextSteps.length > 0 ? (
              <div className="mt-4 flex flex-1 flex-col gap-3">
                {nextSteps.map((step, index) => (
                  <Link
                    key={step.label}
                    to={step.to}
                    className="flex items-start gap-3 rounded-lg border border-line bg-surface-soft p-3 transition-shadow hover:shadow-card-hover"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand text-xs font-black text-white">
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-ink">{step.label}</span>
                  </Link>
                ))}
                <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                  Completing these unlocks sharper recommendations, skill-gap analysis, and
                  internship ranking.
                </p>
              </div>
            ) : (
              <div className="mt-4 flex flex-1 flex-col items-center justify-center gap-3 text-center">
                <span className="grid h-14 w-14 place-items-center rounded-full bg-brand-soft">
                  <Icon name="trophy" size={28} className="text-brand-deep" />
                </span>
                <p className="text-sm font-bold text-ink">You're all set!</p>
                <p className="text-xs text-ink-muted">
                  Everything's complete. Time to explore the tools below.
                </p>
                {currentRoadmap && (
                  <Link to="/roadmaps" className="btn-primary !h-10 !px-4 !text-sm">
                    Continue your roadmap
                  </Link>
                )}
              </div>
            )}

            {currentRoadmap && (
              <div className="mt-5 border-t border-line-soft pt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-ink-soft">Roadmap progress</span>
                  <span className="font-black text-brand-deep">
                    {currentRoadmap.progress_percent}%
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-surface-strong">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${currentRoadmap.progress_percent || 0}%` }}
                  />
                </div>
                <p className="mt-2 truncate text-xs text-ink-muted">{currentRoadmap.title}</p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-10">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Career tools</h2>
              <p className="mt-1 text-sm text-ink-muted">Everything you need to level up, in one place.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TOOL_CARDS.map((tool, index) => (
              <Link
                key={tool.title}
                to={tool.to}
                className="card card-hover group relative flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover"
              >
                <DecorativeShapes variant="card" index={index} />
                <div
                  className={`grid h-12 w-12 place-items-center rounded-xl transition-transform group-hover:scale-110 ${tool.tile}`}
                >
                  <Icon name={tool.icon} size={24} className={tool.iconClass} />
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{tool.title}</h3>
                <p className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted">
                  {tool.description}
                </p>
                <span className="mt-4 text-sm font-bold text-brand-deep group-hover:underline">
                  {tool.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Your skills</h2>
              <p className="mt-1 text-sm text-ink-muted">
                {loading
                  ? 'Loading your saved skills…'
                  : skillCount > 0
                    ? 'These power your career matches and skill-gap analysis.'
                    : 'Add skills to power your career matches.'}
              </p>
            </div>
            <Link to="/onboarding" className="btn-secondary !h-10 !px-4 !text-sm">
              Manage skills
            </Link>
          </div>

          <div className="mt-6">
            {loading ? (
              <div className="rounded-lg border border-line bg-white p-4">
                <div className="flex flex-wrap gap-2">
                  {[1, 2, 3, 4, 5].map((item) => (
                    <span
                      key={item}
                      className="h-8 w-24 animate-pulse rounded-full bg-surface-soft"
                    />
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <span className="h-4 w-32 animate-pulse rounded bg-surface-soft" />
                  <span className="h-4 w-40 animate-pulse rounded bg-surface-soft" />
                  <span className="h-4 w-36 animate-pulse rounded bg-surface-soft" />
                </div>
              </div>
            ) : skillCount === 0 ? (
              <div className="rounded-lg border border-line bg-white px-4 py-8 text-center text-sm text-ink-muted">
                No skills yet — add a few from the{' '}
                <Link to="/onboarding" className="font-bold text-brand-deep hover:underline">
                  onboarding flow
                </Link>{' '}
                to see recommendations here.
              </div>
            ) : (
              <div className="rounded-lg border border-line bg-white p-4">
                <div className="flex flex-wrap gap-2">
                  {skills.slice(0, 12).map((entry) => (
                    <span key={entry.$id} className="chip">
                      {entry.skill?.name || entry.skill_id}
                    </span>
                  ))}
                  {skillCount > 12 && (
                    <span className="chip">+{skillCount - 12} more</span>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <Link to="/recommendations" className="font-bold text-brand-deep hover:underline">
                    View career matches
                  </Link>
                  <Link to="/skill-gaps" className="font-bold text-brand-deep hover:underline">
                    Run a skill-gap analysis
                  </Link>
                  <Link to="/what-if" className="font-bold text-brand-deep hover:underline">
                    Try the What-If simulator
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}