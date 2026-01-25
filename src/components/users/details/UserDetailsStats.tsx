import { ArrowUpRight, Coins, Users, Wallet } from 'lucide-react';
import type { UserOverviewCardsData } from '@/types/UserTypes';
import type { QueryError } from '@/types/ResponseTypes';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import useGetRequest from '@/hooks/useGetRequests';

type UserOverviewCardsResponse = {
  success: boolean;
  data: UserOverviewCardsData;
};

export default function UserDetailsStats({ userId }: { userId: string }) {
  const { data, isLoading } = useGetRequest<UserOverviewCardsResponse, QueryError>({
    URL: `/admin/customer/${userId}/overview-cards`,
    queryKey: ['user-overview-cards', userId],
  });

  const cardsData = data?.data;

  const stats = [
    {
      title: 'USDT BALANCE',
      value: cardsData ? `$${parseFloat(cardsData.usdt_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null,
      icon: Wallet,
      iconColor: 'bg-primary/10 text-primary',
    },
    {
      title: 'NGN BALANCE',
      value: cardsData ? `₦${parseFloat(cardsData.ngn_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null,
      icon: Coins,
      iconColor: 'bg-green-500/10 text-green-500',
    },
    {
      title: 'TOTAL SENT',
      value: cardsData ? `$${parseFloat(cardsData.total_sent).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null,
      icon: ArrowUpRight,
      iconColor: 'bg-orange-500/10 text-orange-500',
    },
    {
      title: 'REFERRAL EARNINGS',
      value: cardsData ? `$${parseFloat(cardsData.referral_earnings).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : null,
      icon: Users,
      iconColor: 'bg-indigo-500/10 text-indigo-500',
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-card border-border overflow-hidden">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-6 w-6 rounded-md" />
              </div>
              <Skeleton className="h-7 w-28" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <Card key={i} className="bg-card border-border overflow-hidden">
          <CardContent className="p-5">
            <div className="flex justify-between items-start mb-4">
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                {stat.title}
              </span>
              <div className={cn("p-1.5 rounded-md", stat.iconColor)}>
                <stat.icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xl font-bold text-foreground">{stat.value || '$0.00'}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
