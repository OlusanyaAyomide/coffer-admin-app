import { Skeleton } from '@/components/ui/skeleton'

/** Matches the page's block rhythm so the layout doesn't jump when data lands. */
export default function OverviewSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-[116px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Skeleton className="h-[420px] rounded-lg" />
        <Skeleton className="h-[420px] rounded-lg" />
      </div>
      <Skeleton className="h-[280px] rounded-lg" />
      <div className="grid gap-4 lg:grid-cols-2">
        <Skeleton className="h-[300px] rounded-lg" />
        <Skeleton className="h-[300px] rounded-lg" />
      </div>
    </div>
  )
}
