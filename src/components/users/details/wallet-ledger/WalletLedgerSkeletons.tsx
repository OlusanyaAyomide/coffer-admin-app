import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export function TotalPortfolioSkeleton() {
  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="h-3 w-16" />
        </div>
        <div className="mt-3">
          <Skeleton className="h-3 w-28 mb-1.5" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardHeader>
      <CardContent className="mt-auto pt-2">
        <Skeleton className="h-9 w-36 mb-2" />
        <Skeleton className="h-4 w-24" />
      </CardContent>
    </Card>
  );
}

export function BalanceCardSkeleton() {
  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-6 w-10" />
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-2">
        <Skeleton className="h-9 w-32" />
        <div className="space-y-4">
          <div className="flex justify-between">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-px w-full" />
          <div className="flex justify-between">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-16" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ChartSkeleton() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <Skeleton className="h-6 w-40" />
      </CardHeader>
      <CardContent className="flex-1 pb-4 pt-6">
        <div className="flex items-center justify-center gap-8">
          <Skeleton className="h-[200px] w-[200px] rounded-full" />
          <div className="flex flex-col gap-3">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
