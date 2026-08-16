const CARD_PATTERNS = [
  <>
    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-brand/5" />
    <div className="pointer-events-none absolute right-2 top-2 h-12 w-12 rounded-full bg-accent-yellow/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-brand-deep/5" />
    <div className="pointer-events-none absolute -right-6 -top-6 h-14 w-14 rounded-full bg-accent-purple/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -top-8 right-8 h-20 w-20 rounded-full bg-accent-blue/5" />
    <div className="pointer-events-none absolute -left-4 -bottom-4 h-16 w-16 rounded-2xl bg-accent-yellow/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -right-8 -bottom-8 h-24 w-24 rounded-full bg-warning/5" />
    <div className="pointer-events-none absolute left-4 -top-6 h-10 w-10 rounded-full bg-accent-orange/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -left-8 -top-8 h-22 w-22 rounded-full bg-accent-purple/5" />
    <div className="pointer-events-none absolute right-4 bottom-4 h-9 w-9 rounded-full bg-brand/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -top-10 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-brand/5" />
    <div className="pointer-events-none absolute -bottom-6 -right-6 h-14 w-14 rounded-full bg-accent-blue/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -right-10 -top-10 h-24 w-24 rounded-full bg-accent-yellow/5" />
    <div className="pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full bg-warning/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -bottom-10 -right-10 h-26 w-26 rounded-full bg-brand-deep/5" />
    <div className="pointer-events-none absolute left-6 -top-8 h-12 w-12 rounded-2xl bg-accent-purple/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -left-12 -top-12 h-28 w-28 rounded-full bg-accent-blue/5" />
    <div className="pointer-events-none absolute bottom-4 right-4 h-10 w-10 rounded-full bg-brand/10" />
  </>,
  <>
    <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-warning/5" />
    <div className="pointer-events-none absolute -bottom-8 left-8 h-16 w-16 rounded-full bg-accent-orange/10" />
  </>,
]

export default function DecorativeShapes({ variant = 'default', index = 0 }) {
  if (variant === 'card') {
    return CARD_PATTERNS[index % CARD_PATTERNS.length]
  }
  if (variant === 'band') {
    return (
      <>
        <div className="pointer-events-none absolute -left-8 -top-12 h-40 w-40 rounded-full bg-brand/10" />
        <div className="pointer-events-none absolute -right-6 -bottom-16 h-48 w-48 rounded-full bg-accent-yellow/15" />
      </>
    )
  }
  return (
    <>
      <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-brand/10" />
      <div className="pointer-events-none absolute right-16 top-8 h-20 w-20 rounded-full bg-accent-yellow/20" />
    </>
  )
}