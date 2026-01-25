'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { DividendScheduleData, RecentDividendsResponse } from '@/types/InvestmentTypes';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import useGetRequest from '@/hooks/useGetRequests';

interface UpcomingDividendsSectionProps {
  userId: string;
}

const formatCurrency = (amount: string | number, currency: string = 'NGN') => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (currency === 'NGN') {
    return `₦${numAmount.toLocaleString()}`;
  }
  return `$${numAmount.toLocaleString()}`;
};

export default function UpcomingDividendsSection({ userId }: UpcomingDividendsSectionProps) {
  const { data, isLoading, isError } = useGetRequest<RecentDividendsResponse, Error>({
    URL: `/admin/customer/${userId}/recent-dividends`,
    queryKey: ['recent-dividends', userId],
  });

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-40" />
        <div className="space-y-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Dividends</h3>
        <p className="text-muted-foreground text-sm">Failed to load dividend data.</p>
      </div>
    );
  }

  const lastDividend = data?.data?.last_dividend;
  const upcomingDividends = data?.data?.upcoming_dividends ?? [];

  // Combine last dividend (completed) with upcoming dividends
  const allDividends: Array<DividendScheduleData & { isCompleted: boolean }> = [];

  if (lastDividend) {
    allDividends.push({ ...lastDividend, isCompleted: true });
  }

  upcomingDividends.forEach((dividend) => {
    allDividends.push({ ...dividend, isCompleted: dividend.status === 'completed' });
  });

  if (allDividends.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Dividends</h3>
        <p className="text-muted-foreground text-sm">No dividend records found.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-6">Recent Dividends</h3>

      <div className="space-y-0">
        {allDividends.map((dividend, index) => (
          <div
            key={dividend.id}
            className={cn(
              'flex items-start gap-4 py-4',
              index !== allDividends.length - 1 && 'border-b border-border'
            )}
          >
            {/* Icon */}
            <div className="shrink-0 mt-1">
              {dividend.isCompleted ? (
                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <CheckCircle2 className="h-4 w-4 text-white" />
                </div>
              ) : (
                <div className="h-6 w-6 rounded-full border-2 border-muted-foreground/40 bg-background flex items-center justify-center">
                  <Circle className="h-3 w-3 text-muted-foreground/40" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className={cn('flex-1', !dividend.isCompleted && 'opacity-60')}>
              <h4 className="font-medium text-sm text-foreground">
                {dividend.investment_name}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dividend.isCompleted ? 'Dividend Paid' : 'Upcoming Dividend'}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDateToReadableShort(dividend.payment_date)}</span>
              </div>
            </div>

            {/* Amount and View */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(dividend.amount)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-transparent p-0 h-auto font-normal"
              >
                View
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
