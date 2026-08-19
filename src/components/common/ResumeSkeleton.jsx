function Skeleton({ className = '' }) {
  return <div aria-hidden="true" className={`animate-pulse rounded-md bg-surface-strong ${className}`} />
}

function SkeletonCard({ children, className = '' }) {
  return <div className={`card ${className}`}>{children}</div>
}

function ScoreBarSkeleton() {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-12" />
      </div>
      <Skeleton className="mt-1.5 h-2 w-full rounded-full" />
    </div>
  )
}

function ListSkeleton() {
  return (
    <div>
      <Skeleton className="h-5 w-40" />
      <div className="mt-3 space-y-2">
        {[0, 1, 2].map((item) => (
          <div key={item} className="flex items-start gap-2">
            <Skeleton className="mt-1.5 h-1.5 w-1.5 rounded-full" />
            <Skeleton className="h-3.5 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function ExtractSkeleton() {
  return (
    <div className="mt-8 space-y-6" aria-busy="true" aria-label="Extracting resume text">
      <SkeletonCard>
        <div className="flex items-center gap-5">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="min-w-0 flex-1">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <Skeleton className="h-4 w-44" />
        <div className="mt-4 space-y-3">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-1/2" />
        </div>
        <Skeleton className="mt-6 h-11 w-40" />
      </SkeletonCard>
    </div>
  )
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Analyzing resume">
      <SkeletonCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-52" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
          <Skeleton className="h-12 w-24 rounded-2xl" />
        </div>
        <div className="mt-6 space-y-4">
          <ScoreBarSkeleton />
          <ScoreBarSkeleton />
          <ScoreBarSkeleton />
          <ScoreBarSkeleton />
          <ScoreBarSkeleton />
          <ScoreBarSkeleton />
          <ScoreBarSkeleton />
        </div>
      </SkeletonCard>
      <div className="grid gap-6 lg:grid-cols-2">
        <SkeletonCard>
          <ListSkeleton />
        </SkeletonCard>
        <SkeletonCard>
          <ListSkeleton />
        </SkeletonCard>
      </div>
      <SkeletonCard>
        <ListSkeleton />
      </SkeletonCard>
    </div>
  )
}

export function MatchSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Matching resume to job">
      <SkeletonCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-44" />
            <Skeleton className="mt-2 h-4 w-72" />
          </div>
          <Skeleton className="h-12 w-24 rounded-2xl" />
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((col) => (
            <div key={col}>
              <Skeleton className="h-5 w-32" />
              <div className="mt-3 flex flex-wrap gap-2">
                {[0, 1, 2, 3].map((chip) => (
                  <Skeleton key={chip} className="h-7 w-20 rounded-full" />
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {[0, 1, 2].map((card) => (
            <div key={card} className="rounded-lg border border-line bg-surface-soft p-4">
              <div className="flex items-center justify-between gap-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
              <Skeleton className="mt-3 h-3.5 w-full" />
            </div>
          ))}
        </div>
      </SkeletonCard>
      <SkeletonCard>
        <ListSkeleton />
      </SkeletonCard>
    </div>
  )
}

export function OptimizeSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Optimizing resume wording">
      <SkeletonCard>
        <Skeleton className="h-7 w-56" />
        <Skeleton className="mt-2 h-4 w-80" />
        <div className="mt-6 space-y-3 border-t border-line pt-6">
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-9 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-9 w-2/3" />
        </div>
        <Skeleton className="mt-6 h-11 w-44" />
      </SkeletonCard>
    </div>
  )
}

export function GenerateSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Generating LaTeX resume">
      <SkeletonCard>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Skeleton className="h-7 w-64" />
            <Skeleton className="mt-2 h-4 w-80" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-11 w-36 rounded-2xl" />
            <Skeleton className="h-11 w-36 rounded-2xl" />
          </div>
        </div>
        <div className="mt-6 rounded-md border border-line bg-surface-soft p-4">
          <div className="space-y-2">
            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((line) => (
              <Skeleton key={line} className={`h-3 ${line % 3 === 0 ? 'w-full' : line % 3 === 1 ? 'w-11/12' : 'w-4/5'}`} />
            ))}
          </div>
        </div>
      </SkeletonCard>
    </div>
  )
}

export function GenericSkeleton({ label }) {
  return (
    <div className="space-y-6" aria-busy="true" aria-label={label || 'Processing'}>
      <SkeletonCard className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-5 w-40" />
        </div>
        <Skeleton className="h-5 w-24" />
      </SkeletonCard>
      <SkeletonCard>
        <ScoreBarSkeleton />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-3.5 w-full" />
          <Skeleton className="h-3.5 w-11/12" />
          <Skeleton className="h-3.5 w-4/5" />
        </div>
      </SkeletonCard>
    </div>
  )
}

const LABELS = {
  'Extracting…': ExtractSkeleton,
  'Analyzing…': AnalysisSkeleton,
  'Matching…': MatchSkeleton,
  'Optimizing…': OptimizeSkeleton,
  'Generating LaTeX…': GenerateSkeleton,
}

export default function ResumeSkeleton({ phase }) {
  const Phase = LABELS[phase] || GenericSkeleton
  return <Phase label={phase} />
}