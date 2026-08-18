import { useEffect, useState } from 'react'
import Icon from '../common/Icon'

const AUTO_ADVANCE_MS = 4000

const PRESS_ITEMS = [
  {
    id: 1,
    source: 'The Hindu',
    time: '2d ago',
    category: 'AI',
    title: 'National skilling programme to train students in AI fundamentals',
    snippet: 'A new government-backed initiative will bring foundational AI and prompt literacy to campus curriculums across the country.',
  },
  {
    id: 2,
    source: 'Economic Times',
    time: '3d ago',
    category: 'Careers',
    title: 'Product and data roles lead the rebound in tech hiring',
    snippet: 'Entry-level demand is shifting from generic software roles toward product, data, and full-stack specialisations.',
  },
  {
    id: 3,
    source: 'TechCrunch',
    time: '4d ago',
    category: 'Devices',
    title: 'Edge AI chips bring on-device intelligence to budget phones',
    snippet: 'New low-power processors are enabling local language models without a cloud connection.',
  },
  {
    id: 4,
    source: 'CIO',
    time: '6d ago',
    category: 'Industry',
    title: 'Cloud cost optimisation tops the agenda for IT leaders',
    snippet: 'FinOps practices are moving from finance teams into everyday engineering workflows.',
  },
  {
    id: 5,
    source: 'Nature',
    time: '1w ago',
    category: 'Research',
    title: 'Quantum computing graduates from the lab to early pilots',
    snippet: 'Hybrid classical-quantum workloads are entering production trials in logistics and chemistry.',
  },
  {
    id: 6,
    source: 'HackerRank Blog',
    time: '1w ago',
    category: 'Learning',
    title: 'Coding bootcamps double down on project portfolios',
    snippet: 'Hands-on, portfolio-driven learning is replacing theory-first assessments in tech education.',
  },
]

export default function PressSection() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const items = PRESS_ITEMS
  const count = items.length

  const next = () => setIndex((current) => (current + 1) % count)
  const prev = () => setIndex((current) => (current - 1 + count) % count)

  useEffect(() => {
    if (paused) return
    const timer = setInterval(next, AUTO_ADVANCE_MS)
    return () => clearInterval(timer)
  }, [paused]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section
      className="mt-8"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Icon name="megaphone" size={18} className="text-brand-deep" />
        <h2 className="text-xl font-black tracking-tight">In The Press</h2>
        <span className="rounded-full bg-brand-soft px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide text-brand-deep">
          Curated highlights
        </span>
      </div>

      <div className="relative mt-4">
        <div className="overflow-hidden rounded-lg border border-line bg-white">
          <div
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${index * 100}%)` }}
          >
            {items.map((item) => (
              <div key={item.id} className="w-full shrink-0 px-1 py-1">
                <article className="mx-auto max-w-xl p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-black text-brand-deep">{item.source}</span>
                    <span className="shrink-0 rounded-full bg-warm px-2 py-0.5 text-[11px] font-bold text-ink-muted">
                      {item.category}
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg font-bold leading-snug text-ink">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-muted">{item.snippet}</p>
                  <p className="mt-3 text-xs font-bold text-ink-soft">{item.time}</p>
                </article>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={prev}
          aria-label="Previous news"
          className="absolute -left-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-popover transition-colors hover:text-brand-deep"
        >
          <Icon name="chevron-left" size={18} />
        </button>
        <button
          type="button"
          onClick={next}
          aria-label="Next news"
          className="absolute -right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full border border-line bg-white text-ink shadow-popover transition-colors hover:text-brand-deep"
        >
          <Icon name="chevron-right" size={18} />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-center gap-2">
        {items.map((item, dotIndex) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setIndex(dotIndex)}
            aria-label={`Go to news ${dotIndex + 1}`}
            className={`h-2 rounded-full transition-all ${
              dotIndex === index ? 'w-6 bg-brand' : 'w-2 bg-line hover:bg-ink-soft'
            }`}
          />
        ))}
      </div>
    </section>
  )
}