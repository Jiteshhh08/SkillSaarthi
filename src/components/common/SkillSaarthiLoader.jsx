import { useEffect, useRef, useState } from 'react'
import compactLogo from '../../assets/skillsaarthi_logo2.png'

export default function SkillSaarthiLoader({ onDone }) {
  const [phase, setPhase] = useState(0)
  const reducedRef = useRef(false)

  useEffect(() => {
    reducedRef.current = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reducedRef.current) {
      const t = setTimeout(() => onDone?.(), 380)
      return () => clearTimeout(t)
    }
    // S 350, kill 600, Saarthi 700, hold 400, compact 600, hold 250, exit 400
    const timers = [
      setTimeout(() => setPhase(1), 360),
      setTimeout(() => setPhase(2), 980),
      setTimeout(() => setPhase(3), 1700),
      setTimeout(() => setPhase(4), 2100),
      setTimeout(() => setPhase(5), 2700),
      setTimeout(() => setPhase(6), 2950),
      setTimeout(() => onDone?.(), 3350),
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
        <img src={compactLogo} alt="SkillSaarthi" className="h-16 w-16 object-contain" />
      </div>
    )
  }

  const showCompact = phase >= 4 && phase < 6
  const showWordmark = phase < 4
  const exiting = phase === 6

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#fafafa] px-6 transition-opacity ${exiting ? 'opacity-0 pointer-events-none duration-700' : 'opacity-100 duration-400'}`}
      aria-label="Loading SkillSaarthi"
    >
      {/* Wordmark: S -> kill -> Saarthi — Skill dark blue, Saarthi light green per logo */}
      <div
        className={`flex items-baseline justify-center transition-all duration-600 ease-[cubic-bezier(0.22,1,0.36,1)] ${showWordmark ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.88]'}`}
        style={{ fontFamily: 'Lato, sans-serif', fontWeight: 900, letterSpacing: '0.02em' }}
      >
        {/* Skill = dark blue #0a2e2e */}
        <span className="relative inline-block overflow-hidden text-[36px] md:text-[44px] leading-none text-[#0a2e2e]">
          <span
            className="inline-block overflow-hidden whitespace-nowrap border-r-[2px] border-brand-deep"
            style={{
              maxWidth: phase >= 0 ? '1ch' : 0,
              animation: phase === 0 ? 'typeS 360ms steps(1, end) forwards' : undefined,
              borderRightColor: phase === 0 ? '#0f766e' : 'transparent',
            }}
          >
            S
          </span>
        </span>
        <span className="relative inline-block overflow-hidden text-[36px] md:text-[44px] leading-none text-[#0a2e2e]">
          <span
            className="inline-block overflow-hidden whitespace-nowrap"
            style={{
              maxWidth: phase < 1 ? 0 : phase === 1 ? '4ch' : '4ch',
              transition: phase === 1 ? 'max-width 600ms steps(4, end)' : undefined,
            }}
          >
            kill
          </span>
        </span>
        {/* Saarthi = light green/teal #14bf96 as per logo */}
        <span className="relative inline-block overflow-hidden text-[36px] md:text-[44px] leading-none text-[#14bf96] ml-[0.04em]">
          <span
            className="inline-block overflow-hidden whitespace-nowrap"
            style={{
              maxWidth: phase < 2 ? 0 : '7ch',
              transition: phase === 2 ? 'max-width 720ms steps(7, end)' : undefined,
            }}
          >
            Saarthi
          </span>
          {phase === 2 && <span className="inline-block h-[0.9em] w-[2px] translate-y-1 bg-[#14bf96] animate-[blink_0.7s_step-end_infinite] ml-1" />}
        </span>
      </div>

      {/* Compact @2nd logo — zooms out to reveal Home */}
      <div
        className={`absolute grid place-items-center transition-all ease-[cubic-bezier(0.22,1,0.36,1)] ${showCompact ? 'opacity-100 scale-100 duration-600' : exiting ? 'opacity-100 scale-[22] duration-700' : 'opacity-0 scale-75 duration-600'}`}
        style={{ transformOrigin: 'center' }}
      >
        <img src={compactLogo} alt="SkillSaarthi compact" className="h-16 w-16 md:h-20 md:w-20 object-contain drop-shadow-sm" />
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
        @keyframes typeS { 0% { max-width: 0 } 100% { max-width: 1ch } }
        @keyframes blink { 0%,100% { opacity: 1 } 50% { opacity: 0 } }
      `}</style>
    </div>
  )
}

// Session gate — only show on initial load per session
export function useShouldShowLoader() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('ss_loader_shown')) {
      setShow(false)
      return
    }
    setShow(true)
  }, [])
  const markShown = () => {
    try { sessionStorage.setItem('ss_loader_shown', '1') } catch {}
    setShow(false)
  }
  return [show, markShown]
}
