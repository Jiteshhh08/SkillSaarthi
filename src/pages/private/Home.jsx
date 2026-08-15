import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import { isProfileComplete } from '../../services/profile'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import WhatWeDo from '../../components/home/WhatWeDo'

const TOOLS = [
  {
    icon: '🎯',
    name: 'Career match',
    description: 'See which careers fit your profile and why.',
    to: '/assessment',
  },
  {
    icon: '🧩',
    name: 'Skill gaps',
    description: 'Find out which skills to learn next.',
    to: '/skill-gaps',
  },
  {
    icon: '🐙',
    name: 'GitHub analysis',
    description: 'Turn your code into a career profile.',
    to: '/github',
  },
  {
    icon: '💼',
    name: 'Internships',
    description: 'Discover matches ranked just for you.',
    to: '/internships',
  },
]

export default function Home() {
  const { user, profile } = useAuth()
  const { isAdmin, loading: adminLoading } = useAdmin()
  const complete = isProfileComplete(profile)

  if (adminLoading) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="flex min-h-[60vh] items-center justify-center text-ink-muted">Loading…</div>
        <Footer />
      </div>
    )
  }

  const cta = isAdmin
    ? { label: 'Open admin panel', to: '/admin/internships' }
    : complete
      ? { label: 'Go to dashboard', to: '/dashboard' }
      : { label: 'Continue onboarding', to: '/onboarding' }

  return (
    <div className="min-h-screen">
      <TopBar />

      <section className="bg-warm">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-16 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.08em]">Welcome back</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight md:text-5xl">
            Hi {(user?.name || 'there').split(' ')[0]},
          </h1>
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

      <section className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-2xl font-bold tracking-tight">Jump back in</h2>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => (
            <Link
              key={tool.name}
              to={tool.to}
              className="card card-hover flex flex-col transition-shadow hover:shadow-card-hover"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft text-2xl">
                {tool.icon}
              </div>
              <h3 className="mt-4 text-base font-bold">{tool.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{tool.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}