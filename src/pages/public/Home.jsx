import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import { isProfileComplete } from '../../services/profile'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import WhatWeDo from '../../components/home/WhatWeDo'
import Icon from '../../components/common/Icon'
import DecorativeShapes from '../../components/common/DecorativeShapes'

const SUBJECTS = [
  {
    name: 'Software & Technology',
    description: 'Full Stack, Backend, Frontend, Mobile, and Software Engineering paths.',
    icon: 'code-2',
  },
  {
    name: 'AI & Data',
    description: 'Data Analyst, Data Scientist, ML Engineer, and AI Engineer careers.',
    icon: 'brain',
  },
  {
    name: 'Cloud',
    description: 'Cloud Engineer and DevOps Engineer cloud-infrastructure skills.',
    icon: 'cloud',
  },
  {
    name: 'Cybersecurity',
    description: 'Security Analyst and Security Engineer defensive skill paths.',
    icon: 'shield-check',
  },
  {
    name: 'Programming Foundations',
    description: 'JavaScript, Python, Java, C++, SQL, and HTML/CSS core skills.',
    icon: 'gear',
  },
  {
    name: 'Soft Skills',
    description: 'Communication, problem solving, teamwork, and leadership.',
    icon: 'handshake',
  },
]

export default function Home() {
  const { user, profile, profileLoading, loading: authLoading } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()

  // Logged-in view merged into same Home (so / and /home share one component)
  if (user) {
    const isChecking = authLoading || profileLoading || adminLoading
    if (isChecking) {
      return (
        <div className="min-h-screen">
          <TopBar />
          <section className="relative overflow-hidden bg-warm">
            <DecorativeShapes variant="band" />
            <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-16 text-center">
              <div className="h-4 w-28 animate-pulse rounded-full bg-black/[0.06]" />
              <div className="mt-4 h-10 w-64 animate-pulse rounded-lg bg-black/[0.06]" />
              <div className="mt-4 h-6 w-96 max-w-full animate-pulse rounded-full bg-black/[0.04]" />
              <div className="mt-8 h-11 w-40 animate-pulse rounded-full bg-black/[0.06]" />
            </div>
          </section>
          <WhatWeDo mode="user" />
          <Footer />
        </div>
      )
    }
    const complete = isProfileComplete(profile)
    const cta = isAdmin
      ? { label: 'Open admin panel', to: '/admin/internships' }
      : complete
        ? { label: 'Go to dashboard', to: '/dashboard' }
        : { label: 'Continue onboarding', to: '/onboarding' }
    return (
      <div className="min-h-screen">
        <TopBar />
        <section className="relative overflow-hidden bg-warm">
          <DecorativeShapes variant="band" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-16 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.08em]">Welcome back</p>
            <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">Hi {(user?.name || 'there').split(' ')[0]},</h1>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink-muted">
              {isAdmin
                ? 'You are signed in as an administrator — manage the internship catalog below.'
                : complete
                  ? 'Your career hub is ready — pick up where you left off.'
                  : 'Finish setting up your profile to unlock your career matches.'}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to={cta.to} className="btn-primary">
                {cta.label}
              </Link>
            </div>
          </div>
        </section>
        <WhatWeDo mode="user" />
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopBar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-warm">
        <DecorativeShapes variant="band" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.08em]">Your career journey starts here</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight tracking-tight text-ink-strong md:text-6xl">
            For every student, every skill, real career results.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            skillsaarthi maps your current skills to your ideal career, shows exactly what you're
            missing, and builds a personalized learning roadmap to get you career-ready.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/signup" className="btn-primary">Get started</Link>
            <Link to="/login" className="btn-secondary">Explore careers</Link>
          </div>
        </div>
      </section>

      <WhatWeDo mode="guest" />

      {/* Subject tiles */}
      <section id="subjects" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-bold tracking-tight">What do you want to learn?</h2>
        <p className="mt-2 text-lg text-ink-muted">Pick an area to explore career-ready skills.</p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {SUBJECTS.map((subject, index) => (
            <Link
              key={subject.name}
              to="/signup"
              className="card card-hover group relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg"
            >
              <DecorativeShapes variant="card" index={index} />
              <div className="grid h-24 w-full place-items-center rounded-md bg-promo">
                <Icon name={subject.icon} size={40} className="text-brand-deep" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{subject.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{subject.description}</p>
              <p className="mt-4 text-sm font-bold text-brand-deep group-hover:underline">Learn more →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Encouragement band */}
      <section className="relative overflow-hidden bg-promo">
        <DecorativeShapes variant="band" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center">
          <Icon name="sprout" size={48} className="text-brand-deep" />
          <div>
            <h2 className="text-2xl font-bold">Every journey starts with one skill.</h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">
              Build a profile in minutes, tell us what you already know, and let skillsaarthi turn
              that into a clear, encouraging path to your dream career.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}