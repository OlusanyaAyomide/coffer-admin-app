import { createFileRoute } from '@tanstack/react-router';
import { Coins, Layers, TrendingUp, Users } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  formatMoney,
  INVESTMENT_STATUS_LABELS,
} from '@/lib/cofferFormat';
import useInvestmentStats from '@/hooks/useInvestmentStats';

export const Route = createFileRoute('/_admin/coffer/performance')({
  component: PerformancePage,
});

const STATUS_ORDER: Array<keyof typeof INVESTMENT_STATUS_LABELS> = [
  'draft',
  'awaiting_start',
  'active',
  'matured',
  'cancelled',
];

function PerformancePage() {
  const { stats, isStatsLoading } = useInvestmentStats();

  const capitalEntries = stats ? Object.entries(stats.capital_raised) : [];

  const topCards = stats
    ? [
        {
          title: 'TOTAL INVESTMENTS',
          value: String(stats.total_investments),
          icon: Layers,
          iconColor: 'bg-primary/10 text-primary',
        },
        {
          title: 'TOTAL INVESTORS',
          value: String(stats.total_investors),
          icon: Users,
          iconColor: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          title: 'UNITS SOLD',
          value: `${stats.total_units_sold} / ${stats.total_units}`,
          icon: TrendingUp,
          iconColor: 'bg-green-500/10 text-green-500',
        },
        {
          title: 'DIVIDENDS PROCESSED',
          value: `${stats.dividends.processed} / ${stats.dividends.total}`,
          icon: Coins,
          iconColor: 'bg-orange-500/10 text-orange-500',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-foreground">Performance</h1>
        <p className="text-muted-foreground">
          Portfolio-wide investment metrics across every coffer.
        </p>
      </div>

      {isStatsLoading || !stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {topCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconColor}`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">{stat.title}</p>
                    <p className="truncate font-medium text-foreground">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Capital raised
                </h3>
                {capitalEntries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No capital raised yet.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {capitalEntries.map(([currency, amount]) => (
                      <div
                        key={currency}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-muted-foreground">
                          {currency}
                        </span>
                        <span className="font-medium text-foreground">
                          {formatMoney(
                            amount,
                            currency as 'NGN' | 'USDT',
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-5">
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Investments by status
                </h3>
                <div className="space-y-2">
                  {STATUS_ORDER.map((status) => (
                    <div
                      key={status}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-muted-foreground">
                        {INVESTMENT_STATUS_LABELS[status]}
                      </span>
                      <span className="font-medium text-foreground">
                        {stats.counts_by_status[status] ?? 0}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
