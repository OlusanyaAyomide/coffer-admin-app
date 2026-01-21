import { BarChart3, CheckCircle, Clock, FileCheck } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type KycStats = {
  total_kyc: number;
  this_week: number;
  pending_review: number;
  processed_kyc: number;
  approved: number;
  rejected: number;
};

type StatsCardProps = {
  stats: KycStats | null;
  isLoading?: boolean;
  onViewAnalytics?: () => void;
};

function StatsCardSkeleton() {
  return (
    <Card className="bg-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function KycStatsCards({ stats, isLoading, onViewAnalytics }: StatsCardProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total KYC',
      value: stats.total_kyc.toLocaleString(),
      subtitle: `This week: ${stats.this_week}`,
      subtitleColor: 'text-primary',
      icon: FileCheck,
      iconColor: 'text-primary',
    },
    {
      title: 'Pending Review',
      value: stats.pending_review.toString(),
      subtitle: 'Requires attention',
      subtitleColor: 'text-orange-500',
      icon: Clock,
      iconColor: 'text-orange-500',
    },
    {
      title: 'Processed KYC',
      value: stats.processed_kyc.toLocaleString(),
      subtitle: `Approved: ${stats.approved} | Rejected: ${stats.rejected}`,
      subtitleColor: 'text-muted-foreground',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-4">
      {/* View Analytics Button */}
      {onViewAnalytics && (
        <div className="flex justify-end">
          <Button variant="outline" size="sm" className="gap-2" onClick={onViewAnalytics}>
            <BarChart3 className="h-4 w-4" />
            View Analytics
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card key={card.title} className="bg-card border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    {card.title}
                  </p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    {card.value}
                  </p>
                  <p className={cn('text-sm mt-1', card.subtitleColor)}>
                    {card.subtitle}
                  </p>
                </div>
                <card.icon className={cn('h-8 w-8', card.iconColor)} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
