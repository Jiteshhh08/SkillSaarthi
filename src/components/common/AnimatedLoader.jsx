export default function AnimatedLoader({ message }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-6 text-center">
      <span className="h-10 w-10 animate-spin rounded-full border-2 border-black/[0.08] border-t-[#14bf96] [animation-duration:0.8s]" aria-hidden="true" />
      {message && <p className="mt-4 text-sm font-bold tracking-wide text-ink-muted animate-pulse">{message}</p>}
    </div>
  )
}
