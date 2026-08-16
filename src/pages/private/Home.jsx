import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useAdmin } from '../../hooks/useAdmin'
import { isProfileComplete } from '../../services/profile'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import WhatWeDo from '../../components/home/WhatWeDo'
import DecorativeShapes from '../../components/common/DecorativeShapes'

export default function Home() {
  const { user, profile } = useAuth()
  const { isAdmin } = useAdmin()
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

      <Footer />
    </div>
  )
}