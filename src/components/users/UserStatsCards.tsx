import { Users, CheckCircle, Clock, UserX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { UserStats } from '@/types/UserTypes';
import { cn } from '@/lib/utils';

type StatsCardProps = {
  stats: UserStats;
};

export default function UserStatsCards({ stats }: StatsCardProps) {
  const cards = [
    {
      title: 'Total Users',
      value: stats.total_users.toLocaleString(),
      subtitle: `+${stats.growth_percentage}% from last month`,
      subtitleColor: 'text-green-500',
      icon: Users,
      iconColor: 'text-primary',
    },
    {
      title: 'Active Users',
      value: stats.active_users.toLocaleString(),
      subtitle: `${((stats.active_users / stats.total_users) * 100).toFixed(1)}% of total`,
      subtitleColor: 'text-muted-foreground',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    {
      title: 'Pending KYC',
      value: stats.pending_kyc.toString(),
      subtitle: 'Requires review',
      subtitleColor: 'text-yellow-500',
      icon: Clock,
      iconColor: 'text-yellow-500',
    },
    {
      title: 'Suspended',
      value: stats.suspended.toString(),
      subtitle: 'High risk accounts',
      subtitleColor: 'text-red-500',
      icon: UserX,
      iconColor: 'text-red-500',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
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
  );
}
