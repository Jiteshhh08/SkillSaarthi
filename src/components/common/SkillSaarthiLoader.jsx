import { useEffect, useRef, useState } from 'react'

export default function SkillSaarthiLoader({ onDone }) {
  const [phase, setPhase] = useState(0)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducedRef.current) {
      const t = setTimeout(() => onDone?.(), 200)
      return () => clearTimeout(t)
    }
    // Compact intro: S 150, kill 300, सारथी 300, hold 150, exit 300
    const timers = [
      setTimeout(() => setPhase(1), 150),
      setTimeout(() => setPhase(2), 450),
      setTimeout(() => setPhase(3), 750),
      setTimeout(() => setPhase(4), 900),
      setTimeout(() => onDone?.(), 1100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [onDone])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  if (reducedRef.current) {
    return (
      <div className="fixed inset-0 z-[9999] grid place-items-center bg-[#fafafa]">
        <p className="text-[36px] md:text-[44px] leading-none" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 900 }}>
          <span className="text-[#0a2e2e]">Skill</span>
          <span className="text-[#14bf96]" style={{ fontFamily: '"Noto Sans Devanagari", Lato, sans-serif' }}>सारथी</span>
        </p>
      </div>
    )
  }

  const exiting = phase === 4

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fafafa] px-6 transition-opacity ${exiting ? 'opacity-0 pointer-events-none duration-300' : 'opacity-100 duration-200'}`}
      aria-label="Loading SkillSaarthi"
    >
      {/* Wordmark — Skill + सारथी perfectly aligned as in reference image */}
      <div
        className="flex items-baseline justify-center gap-0 text-[36px] md:text-[44px] leading-none opacity-100 scale-100"
        style={{ letterSpacing: '0.02em' }}
      >
        {/* Skill — dark blue #0a2e2e, EN */}
        <span className="inline-flex items-baseline overflow-x-hidden overflow-y-visible py-3 text-[#0a2e2e]" style={{ fontFamily: 'Lato, sans-serif', fontWeight: 900 }}>
          <span
            className="inline-block whitespace-nowrap border-r-[2px] border-brand-deep pr-[1px] overflow-hidden align-baseline text-[#0a2e2e]"
            style={{
              maxWidth: phase === 0 ? '1ch' : phase >= 1 ? '1ch' : 0,
              display: 'inline-block',
              animation: phase === 0 ? 'typeS 150ms steps(1, end) forwards' : undefined,
              borderRightColor: phase === 0 ? '#0f766e' : 'transparent',
            }}
          >
            S
          </span>
          <span
            className="inline-block whitespace-nowrap overflow-hidden align-baseline text-[#0a2e2e]"
            style={{
              maxWidth: phase < 1 ? 0 : '4ch',
              display: 'inline-block',
              transition: phase === 1 ? 'max-width 300ms steps(4, end)' : undefined,
            }}
          >
            kill
          </span>
        </span>
        {/* सारथी — Hindi light green, same baseline/size */}
        <span className="inline-flex items-baseline overflow-x-hidden overflow-y-visible py-3 ml-0 text-[#14bf96]" style={{ fontFamily: '"Noto Sans Devanagari", Lato, sans-serif', fontWeight: 900 }}>
          <span
            className="inline-block whitespace-nowrap overflow-visible align-baseline"
            style={{
              maxWidth: phase < 2 ? 0 : '6ch',
              display: 'inline-block',
              transition: phase === 2 ? 'max-width 300ms steps(6, end)' : undefined,
            }}
          >
            सारथी
          </span>
          {phase === 2 && <span className="inline-block h-[0.9em] w-[2px] bg-[#14bf96] animate-[blink_0.7s_step-end_infinite] ml-1 align-baseline" />}
        </span>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        @keyframes typeS { 0% { max-width: 0 } 100% { max-width: 1ch } }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  )
}
