import { Link } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import WhatWeDo from '../../components/home/WhatWeDo'

const SUBJECTS = [
  {
    name: 'Software & Technology',
    description: 'Full Stack, Backend, Frontend, Mobile, and Software Engineering paths.',
    icon: '💻',
  },
  {
    name: 'AI & Data',
    description: 'Data Analyst, Data Scientist, ML Engineer, and AI Engineer careers.',
    icon: '🤖',
  },
  {
    name: 'Cloud',
    description: 'Cloud Engineer and DevOps Engineer cloud-infrastructure skills.',
    icon: '☁️',
  },
  {
    name: 'Cybersecurity',
    description: 'Security Analyst and Security Engineer defensive skill paths.',
    icon: '🔒',
  },
  {
    name: 'Programming Foundations',
    description: 'JavaScript, Python, Java, C++, SQL, and HTML/CSS core skills.',
    icon: '⚙️',
  },
  {
    name: 'Soft Skills',
    description: 'Communication, problem solving, teamwork, and leadership.',
    icon: '🤝',
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopBar />

      {/* Hero */}
      <section className="bg-warm">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-20 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.08em]">Your career journey starts here</p>
          <h1 className="mt-6 max-w-3xl text-5xl font-black leading-tight tracking-tight text-ink-strong md:text-6xl">
            For every student, every skill, real career results.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Skill Guide maps your current skills to your ideal career, shows exactly what you're
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
          {SUBJECTS.map((subject) => (
            <Link
              key={subject.name}
              to="/signup"
              className="card card-hover group flex flex-col transition-shadow hover:shadow-lg"
            >
              <div className="grid h-24 w-full place-items-center rounded-md bg-promo text-5xl">
                {subject.icon}
              </div>
              <h3 className="mt-4 text-lg font-bold">{subject.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{subject.description}</p>
              <p className="mt-4 text-sm font-bold text-brand-deep group-hover:underline">Learn more →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Encouragement band */}
      <section className="bg-promo">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-6 py-14 md:flex-row md:items-center">
          <span className="text-5xl">🌱</span>
          <div>
            <h2 className="text-2xl font-bold">Every journey starts with one skill.</h2>
            <p className="mt-2 max-w-2xl text-base leading-relaxed text-ink-muted">
              Build a profile in minutes, tell us what you already know, and let Skill Guide turn
              that into a clear, encouraging path to your dream career.
            </p>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}