import { Link } from 'react-router-dom'
import Icon from '../common/Icon'
import DecorativeShapes from '../common/DecorativeShapes'

const FEATURES = [
  {
    icon: 'target',
    name: 'Career recommendations',
    description: 'Careers ranked against your profile, with a clear reason for every match.',
  },
  {
    icon: 'puzzle',
    name: 'Skill-gap analysis',
    description: 'See which skills you already have and exactly which ones to develop next.',
  },
  {
    icon: 'map',
    name: 'Personalized roadmap',
    description: 'An actionable learning path that turns your gaps into step-by-step progress.',
  },
  {
    icon: 'sparkles',
    name: 'What-if simulator',
    description: 'Experiment with new skills and watch your career options shift.',
  },
  {
    icon: 'file-text',
    name: 'Resume analysis',
    description: 'Understand how your resume lines up with the roles you want.',
  },
  {
    icon: 'github',
    name: 'GitHub analysis',
    description: 'Turn your public GitHub activity into a technical career profile.',
  },
  {
    icon: 'graduation-cap',
    name: 'Course recommendations',
    description: 'Learning resources picked to close your specific skill gaps.',
  },
  {
    icon: 'briefcase',
    name: 'Internship matches',
    description: 'Internships ranked against your skills, goals, and preferences.',
  },
  {
    icon: 'robot',
    name: 'AI career assistant',
    description: 'Conversational guidance grounded in your personal career context.',
  },
]

const STEPS = [
  { title: 'Build your profile', text: 'Share your education, skills, interests, and goals.' },
  { title: 'Complete the assessment', text: 'A short questionnaire tunes your career match.' },
  { title: 'Get career matches', text: 'Ranked careers with an honest explanation of why.' },
  { title: 'Close the gaps', text: 'Know your missing skills and the order to learn them.' },
  { title: 'Follow the roadmap', text: 'Track your progress toward real career readiness.' },
]

export default function WhatWeDo({ mode = 'guest' }) {
  const authenticated = mode === 'user'

  return (
    <>
      <section className="mx-auto max-w-7xl px-6 py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.08em] text-brand-deep">
            What skillsaarthi does
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight">
            One platform for your whole career journey
          </h2>
          <p className="mt-3 text-lg leading-relaxed text-ink-muted">
            Instead of generic career advice, skillsaarthi analyses your education, skills,
            interests, goals, and assessment results to recommend careers, uncover your skill
            gaps, and build a roadmap that shows you exactly what to do next.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, index) => (
            <div
              key={feature.name}
              className="card relative flex flex-col overflow-hidden transition-shadow hover:shadow-card-hover"
            >
              <DecorativeShapes variant="card" index={index} />
              <div className="grid h-12 w-12 place-items-center rounded-full bg-brand-soft">
                <Icon name={feature.icon} size={22} className="text-brand-deep" />
              </div>
              <h3 className="mt-4 text-lg font-bold">{feature.name}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-warm">
        <DecorativeShapes variant="band" />
        <div className="relative mx-auto max-w-7xl px-6 py-16">
          <h2 className="text-3xl font-bold tracking-tight">How it works</h2>
          <p className="mt-2 text-lg text-ink-muted">
            Five steps between you and a clearer career path.
          </p>

          <ol className="mt-8 grid gap-6 md:grid-cols-5">
            {STEPS.map((step, index) => (
              <li key={step.title} className="card">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand text-sm font-black text-white">
                  {index + 1}
                </span>
                <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{step.text}</p>
              </li>
            ))}
          </ol>

          <div className="relative mt-12 flex flex-wrap items-center justify-between gap-6 overflow-hidden rounded-xl bg-cream px-8 py-8">
            <DecorativeShapes variant="card" index={3} />
            <div>
              <h3 className="text-2xl font-bold tracking-tight">
                {authenticated ? 'Ready to continue?' : 'Ready to find your path?'}
              </h3>
              <p className="mt-1 max-w-xl text-base leading-relaxed text-ink-muted">
                {authenticated
                  ? 'Head back to your dashboard to see your matches, gaps, and next steps.'
                  : 'Create a free profile in minutes and get your first career matches.'}
              </p>
            </div>
            {authenticated ? (
              <Link to="/dashboard" className="btn-primary">
                Go to dashboard
              </Link>
            ) : (
              <Link to="/signup" className="btn-primary">
                Get started free
              </Link>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
