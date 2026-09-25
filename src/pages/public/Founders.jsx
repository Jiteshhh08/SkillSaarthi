import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../../components/layout/TopBar'
import Footer from '../../components/layout/Footer'
import Icon, { GithubIcon } from '../../components/common/Icon'
import DecorativeShapes from '../../components/common/DecorativeShapes'

/**
 * To add real photographs, drop the files here (no code changes needed):
 *   public/images/founders/jitesh.jpg
 *   public/images/founders/tusharkant.jpg
 * Until then, an elegant SkillSaarthi-themed monogram placeholder is shown.
 *
 * To add social links later, fill in `github` / `linkedin` below —
 * interactive buttons render automatically; empty values show a styled
 * "coming soon" placeholder instead of a fake link.
 */
const FOUNDERS = [
  {
    name: 'Jitesh',
    role: 'Co-Founder',
    photo: '/images/founders/jitesh.jpg',
    monogram: 'J',
    bio: 'Jitesh is one of the minds behind SkillSaarthi, working on turning ideas around career discovery and skill development into a practical digital experience.',
    focus: ['Career discovery', 'Skill development', 'Product experience'],
    github: 'https://github.com/Jiteshhh08',
    linkedin: 'https://www.linkedin.com/in/jiteshjha08/',
  },
  {
    name: 'Tusharkant',
    role: 'Co-Founder',
    photo: '/images/founders/tusharkant.jpg',
    monogram: 'T',
    bio: 'Tusharkant is one of the minds behind SkillSaarthi, contributing to the product, technology and vision behind the platform.',
    focus: ['Product', 'Technology', 'Vision'],
    github: 'https://github.com/Ninjacat-stack',
    linkedin: 'https://www.linkedin.com/in/tusharkantjena/',
  },
]

const WHY_POINTS = [
  { icon: 'target', text: 'What career path fits them' },
  { icon: 'puzzle', text: 'Which skills they should develop' },
  { icon: 'map', text: 'How to build a roadmap' },
  { icon: 'file-text', text: 'How to present their skills' },
  { icon: 'briefcase', text: 'What opportunities align with their interests' },
]

function Reveal({ children, className = '', delay = 0 }) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`reveal${visible ? ' reveal-visible' : ''}${className ? ` ${className}` : ''}`}
    >
      {children}
    </div>
  )
}

function FounderPhoto({ founder }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="group/photo relative w-[160px] shrink-0 overflow-hidden rounded-xl border border-line bg-promo shadow-card-rest transition-colors duration-300 group-hover:border-brand/40 sm:w-[200px] lg:w-[220px]">
      <div className="relative aspect-[4/5] w-full">
        {/* Elegant placeholder layer — always underneath, visible until (and unless) the photo loads */}
        <div
          aria-hidden={!failed}
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-promo"
        >
          <span className="grid h-16 w-16 place-items-center rounded-full border border-line bg-white text-3xl font-black text-brand-deep">
            {founder.monogram}
          </span>
          <span className="rounded-full border border-line bg-white/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-ink-soft">
            Photo coming soon
          </span>
        </div>
        {!failed && (
          <img
            src={founder.photo}
            alt={`Portrait of ${founder.name}, ${founder.role}, SkillSaarthi`}
            loading="lazy"
            onError={() => setFailed(true)}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover/photo:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover/photo:scale-100"
          />
        )}
      </div>
    </div>
  )
}

function SocialButton({ href, label, founderName, icon }) {
  const base =
    'inline-flex h-10 items-center gap-2 rounded-full border bg-white px-4 text-sm font-bold transition-all duration-200'

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${founderName} on ${label}`}
        className={`${base} border-line text-ink-muted hover:-translate-y-0.5 hover:border-brand hover:bg-brand-soft hover:text-brand-deep`}
      >
        {icon}
        {label}
      </a>
    )
  }

  return (
    <span
      title="Link coming soon"
      aria-disabled="true"
      className={`${base} cursor-default select-none border-line-soft text-ink-disabled`}
    >
      {icon}
      {label}
    </span>
  )
}

function FounderRow({ founder, index }) {
  const num = String(index + 1).padStart(2, '0')
  const reversed = index % 2 === 1

  return (
    <Reveal delay={reversed ? 120 : 0}>
      <article
        className={`group relative overflow-hidden rounded-xl border border-line bg-gradient-to-br from-white via-white to-surface-soft p-6 shadow-card-rest transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-card-hover sm:p-8 lg:p-12`}
      >
        {/* Faint editorial watermark number */}
        <span
          aria-hidden="true"
          className={`pointer-events-none absolute -top-6 hidden select-none text-[8rem] font-black leading-none text-brand/[0.07] transition-transform duration-500 group-hover:translate-y-1.5 lg:block ${
            reversed ? 'left-6' : 'right-6'
          }`}
        >
          {num}
        </span>

        <div
          className={`relative grid items-center gap-8 lg:gap-14 ${
            reversed ? 'lg:grid-cols-[auto_1fr]' : 'lg:grid-cols-[1fr_auto]'
          }`}
        >
          {/* Portrait — compact, supporting visual (mobile-first: appears first, centered) */}
          <div
            className={`flex justify-center ${reversed ? 'lg:order-1' : 'lg:order-2'}`}
          >
            <FounderPhoto founder={founder} />
          </div>

          {/* Content — the primary visual experience */}
          <div
            className={`flex flex-col items-center text-center lg:items-start lg:text-left ${
              reversed ? 'lg:order-2' : 'lg:order-1'
            }`}
          >
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-deep">
              Co-Founder / {num}
            </p>
            <h2 className="mt-3 text-4xl font-black tracking-tight text-ink-strong sm:text-5xl">
              {founder.name}
            </h2>
            <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-ink-soft">
              {founder.role} · SkillSaarthi
            </p>
            <span
              aria-hidden="true"
              className="mt-5 h-0.5 w-12 rounded-full bg-gradient-to-r from-brand to-brand-deep"
            />
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted sm:text-lg">
              {founder.bio}
            </p>
            <div
              className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start"
              aria-label={`${founder.name}'s focus areas`}
            >
              {founder.focus.map((tag) => (
                <span key={tag} className="chip !px-3 !py-1 !text-xs">
                  {tag}
                </span>
              ))}
            </div>
            <div className="mt-7 flex w-full items-center justify-center gap-3 border-t border-line-soft pt-6 lg:justify-start">
              <SocialButton
                href={founder.linkedin}
                label="LinkedIn"
                founderName={founder.name}
                icon={<Icon name="linkedin" size={16} />}
              />
              <SocialButton
                href={founder.github}
                label="GitHub"
                founderName={founder.name}
                icon={<GithubIcon size={16} />}
              />
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  )
}

export default function Founders() {
  useEffect(() => {
    const previousTitle = document.title
    document.title = 'Meet the Founders | SkillSaarthi'
    let meta = document.querySelector('meta[name="description"]')
    const created = !meta
    if (created) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    const previousDescription = meta.getAttribute('content')
    meta.setAttribute(
      'content',
      'Meet the people behind SkillSaarthi and learn about the vision behind the platform.'
    )
    return () => {
      document.title = previousTitle
      if (created) meta.remove()
      else if (previousDescription != null) meta.setAttribute('content', previousDescription)
    }
  }, [])

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <TopBar />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-warm" aria-labelledby="founders-heading">
          <DecorativeShapes variant="band" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-center px-6 pb-24 pt-24 text-center">
            <p className="animate-ss-fade-up text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
              The people behind SkillSaarthi
            </p>
            <h1
              id="founders-heading"
              style={{ animationDelay: '80ms' }}
              className="animate-ss-fade-up mt-6 max-w-4xl text-5xl font-black leading-[1.05] tracking-tight text-ink-strong md:text-7xl"
            >
              Meet the Minds Behind SkillSaarthi
            </h1>
            <p
              style={{ animationDelay: '180ms' }}
              className="animate-ss-fade-up mt-7 max-w-2xl text-lg leading-relaxed text-ink-muted md:text-xl"
            >
              Building technology that helps students navigate skills, careers and
              opportunities with greater clarity.
            </p>
            <a
              href="#founders"
              style={{ animationDelay: '300ms' }}
              className="animate-ss-fade-up mt-14 inline-flex flex-col items-center gap-1 text-sm font-bold text-brand-deep hover:underline"
              aria-label="Scroll to founder profiles"
            >
              <span>Meet them below</span>
              <Icon name="arrow-down" size={18} className="animate-bounce" />
            </a>
          </div>
        </section>

        {/* Typographic brand moment */}
        <section aria-label="Two minds, one mission" className="relative bg-canvas">
          <div className="mx-auto max-w-7xl px-6 py-24 text-center md:py-32">
            <Reveal>
              <span
                aria-hidden="true"
                className="mx-auto mb-10 block h-px w-24 bg-gradient-to-r from-transparent via-brand to-transparent"
              />
            </Reveal>
            <Reveal delay={80}>
              <p className="text-4xl font-black leading-tight tracking-tight text-ink-strong sm:text-5xl md:text-6xl">
                Two minds.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <p className="mt-3 text-4xl font-black leading-tight tracking-tight text-brand-deep sm:text-5xl md:text-6xl">
                One mission.
              </p>
            </Reveal>
            <Reveal delay={360}>
              <p className="text-gradient-brand mt-3 text-4xl font-black leading-tight tracking-tight sm:text-5xl md:text-6xl">
                A Saarthi for every journey.
              </p>
            </Reveal>
            <Reveal delay={480}>
              <span
                aria-hidden="true"
                className="mx-auto mt-10 block h-px w-24 bg-gradient-to-r from-transparent via-brand to-transparent"
              />
            </Reveal>
          </div>
        </section>

        {/* Founder profiles — editorial alternating layout */}
        <section
          id="founders"
          aria-label="Founder profiles"
          className="mx-auto max-w-6xl scroll-mt-24 px-6 pb-8"
        >
          <div className="flex flex-col gap-8 lg:gap-10">
            {FOUNDERS.map((founder, index) => (
              <FounderRow key={founder.name} founder={founder} index={index} />
            ))}
          </div>
        </section>

        {/* Why SkillSaarthi */}
        <section aria-labelledby="why-heading" className="relative overflow-hidden bg-warm">
          <DecorativeShapes variant="band" />
          <div className="relative mx-auto max-w-6xl px-6 py-24">
            <Reveal>
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
                  Why SkillSaarthi
                </p>
                <div className="relative mt-6">
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -left-2 -top-10 select-none text-8xl font-black leading-none text-brand/20"
                  >
                    &ldquo;
                  </span>
                  <h2
                    id="why-heading"
                    className="relative text-3xl font-black leading-tight tracking-tight text-ink-strong sm:text-4xl md:text-5xl"
                  >
                    Career decisions shouldn&rsquo;t feel like navigating without a map.
                  </h2>
                </div>
                <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-muted">
                  Students often have access to endless information, yet struggle to see how
                  it fits together. SkillSaarthi brings career discovery, skill development,
                  roadmaps and opportunities into one platform — so every learner gets a
                  clearer path forward.
                </p>
              </div>
            </Reveal>

            <ul className="mt-12 grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:grid-cols-3">
              {WHY_POINTS.map((point, index) => (
                <li key={point.text}>
                  <Reveal delay={(index % 3) * 90}>
                    <div className="flex items-start gap-4">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-soft">
                        <Icon name={point.icon} size={18} className="text-brand-deep" />
                      </span>
                      <p className="pt-2 text-base font-bold leading-snug text-ink">
                        {point.text}
                      </p>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Vision */}
        <section
          aria-labelledby="vision-heading"
          className="relative overflow-hidden bg-gradient-to-br from-brand-soft via-promo to-warm"
        >
          <DecorativeShapes variant="band" />
          <div className="relative mx-auto max-w-6xl px-6 py-24 text-center">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-deep">
                Our vision
              </p>
              <h2
                id="vision-heading"
                className="mx-auto mt-6 max-w-3xl text-3xl font-black leading-tight tracking-tight text-ink-strong sm:text-4xl md:text-5xl"
              >
                Building the Saarthi for every journey.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ink-muted sm:text-lg">
                A saarthi is a guide — someone who walks beside you. SkillSaarthi aims to be
                that companion for every student, bringing skills, careers and opportunities
                into one clear, guided path.
              </p>
              <div className="mt-10 flex flex-wrap justify-center gap-4">
                <Link to="/signup" className="btn-primary">
                  Start your journey
                </Link>
                <Link to="/" className="btn-secondary">
                  Back to home
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
