import { Skeleton } from '@/components/ui/skeleton';

export function OverviewSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-32 w-[255px] shrink-0 rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-[420px] rounded-lg" />
      <Skeleton className="h-[420px] rounded-lg" />
    </div>
  );
}
