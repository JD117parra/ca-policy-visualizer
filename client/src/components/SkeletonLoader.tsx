import { cn } from '@/lib/utils'

function Bone({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-md bg-muted animate-pulse', className)} />
  )
}

export function SkeletonLoader() {
  return (
    <div className="flex-1 p-8 space-y-10">
      {/* Simulate 3 policy flow groups */}
      {[0, 1, 2].map((group) => (
        <div key={group} className="space-y-4">
          {/* Policy node skeleton */}
          <div className="flex justify-center">
            <div className="rounded-lg border-2 border-muted bg-card px-4 py-3 shadow-sm w-[240px] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Bone className="h-4 w-32" />
                <Bone className="h-5 w-16 rounded-full" />
              </div>
            </div>
          </div>

          {/* Connector lines placeholder */}
          <div className="flex justify-center">
            <Bone className="h-6 w-px" />
          </div>

          {/* Condition nodes skeleton */}
          <div className="flex justify-center gap-4">
            {[0, 1, 2].slice(0, group === 1 ? 2 : 3).map((cond) => (
              <div
                key={cond}
                className="rounded-md border border-muted bg-muted/30 px-3 py-2 w-[170px] space-y-2"
              >
                <Bone className="h-3 w-16" />
                <Bone className="h-3 w-24" />
                <Bone className="h-3 w-20" />
              </div>
            ))}
          </div>

          {/* Connector */}
          <div className="flex justify-center">
            <Bone className="h-6 w-px" />
          </div>

          {/* Control node skeleton */}
          <div className="flex justify-center">
            <div className="rounded-md border border-muted bg-muted/30 px-3 py-2 w-[180px] space-y-2">
              <div className="flex items-center gap-1.5">
                <Bone className="h-3 w-24" />
                <Bone className="h-4 w-8 rounded" />
              </div>
              <Bone className="h-3 w-28" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
