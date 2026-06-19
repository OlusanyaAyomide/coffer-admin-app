import { CheckCircle, Clock, UserX, Users } from 'lucide-react';
import type { UserStats } from '@/types/UserTypes';
import { StatCard } from '@/components/shared/StatCard';
import { Skeleton } from '@/components/ui/skeleton';

type StatsCardProps = {
  stats: UserStats | null;
  isLoading?: boolean;
};

function StatsCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card p-5 pt-6">
      <div className="flex items-start justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="mt-3 h-8 w-16" />
      <Skeleton className="mt-2 h-3 w-28" />
    </div>
  );
}

export default function UserStatsCards({ stats, isLoading }: StatsCardProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.total_users.toLocaleString(),
      subValue: `+${stats.growth_percentage}% from last month`,
      subValueClassName: 'text-emerald-600',
      icon: Users,
      iconColor: 'text-primary',
      accentClassName: 'bg-primary',
    },
    {
      title: 'Active Users',
      value: stats.active_users.toLocaleString(),
      subValue: `${((stats.active_users / stats.total_users) * 100).toFixed(1)}% of total`,
      subValueClassName: 'text-muted-foreground',
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      accentClassName: 'bg-emerald-500',
    },
    {
      title: 'Pending KYC',
      value: stats.pending_kyc.toString(),
      subValue: 'Requires review',
      subValueClassName: 'text-amber-600',
      icon: Clock,
      iconColor: 'text-amber-600',
      accentClassName: 'bg-amber-500',
    },
    {
      title: 'Suspended',
      value: stats.suspended.toString(),
      subValue: 'High risk accounts',
      subValueClassName: 'text-red-600',
      icon: UserX,
      iconColor: 'text-red-600',
      accentClassName: 'bg-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <StatCard
          key={card.title}
          title={card.title}
          value={card.value}
          subValue={card.subValue}
          subValueClassName={card.subValueClassName}
          icon={card.icon}
          iconColor={card.iconColor}
          accentClassName={card.accentClassName}
        />
      ))}
    </div>
  );
}
