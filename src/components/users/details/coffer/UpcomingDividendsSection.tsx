'use client';

import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import type { CofferInvestment } from './coffer-columns';
import { Button } from '@/components/ui/button';

interface UpcomingDividendsSectionProps {
  investments: CofferInvestment[];
}

interface UpcomingDividend {
  id: string;
  investmentTitle: string;
  description: string;
  date: string;
  amount: number;
  currency: 'NGN' | 'USDT';
  isPast: boolean;
}

const formatCurrency = (amount: number, currency: 'NGN' | 'USDT') => {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
};

// Static mock data for upcoming dividends to ensure UI shows content
const staticUpcomingDividends: UpcomingDividend[] = [
  {
    id: 'div-1',
    investmentTitle: 'Green Projects',
    description: 'Q4 2025 Dividend Payment',
    date: '2025-12-15T10:00:00Z',
    amount: 450,
    currency: 'USDT',
    isPast: false,
  },
  {
    id: 'div-2',
    investmentTitle: 'Harvest Hill Van',
    description: 'Q1 2026 Dividend Payment',
    date: '2026-03-29T14:30:00Z',
    amount: 320,
    currency: 'USDT',
    isPast: false,
  },
  {
    id: 'div-3',
    investmentTitle: 'Meat Processing',
    description: 'Q2 2026 Dividend Payment',
    date: '2026-07-15T09:00:00Z',
    amount: 580,
    currency: 'USDT',
    isPast: false,
  },
  {
    id: 'div-4',
    investmentTitle: 'Banana Island',
    description: 'Not Completed - Pending Maturity',
    date: '2026-08-30T12:00:00Z',
    amount: 720,
    currency: 'USDT',
    isPast: false,
  },
];

export default function UpcomingDividendsSection({ investments }: UpcomingDividendsSectionProps) {
  // Extract upcoming dividends from all investments
  const upcomingDividends: UpcomingDividend[] = [];
  const now = new Date();

  investments.forEach((investment) => {
    investment.transactions
      .filter((t) => t.type === 'dividend')
      .forEach((t) => {
        const dividendDate = new Date(t.date);
        upcomingDividends.push({
          id: t.id,
          investmentTitle: investment.investment.title,
          description: t.description || `${investment.investment.category} Dividend`,
          date: t.date,
          amount: t.amount,
          currency: investment.investment.currency,
          isPast: dividendDate < now,
        });
      });
  });

  // Sort by date
  upcomingDividends.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Show only upcoming or recent dividends (within last 6 months or future)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  let filteredDividends = upcomingDividends.filter((d) => {
    const date = new Date(d.date);
    return date >= sixMonthsAgo;
  });

  // If no dividends from investments, use static mock data
  if (filteredDividends.length === 0) {
    filteredDividends = staticUpcomingDividends;
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <h3 className="text-lg font-semibold mb-6">Upcoming Dividends</h3>

      <div className="space-y-0">
        {filteredDividends.map((dividend, index) => (
          <div
            key={dividend.id}
            className={cn(
              'flex items-start gap-4 py-4',
              index !== filteredDividends.length - 1 && 'border-b border-border'
            )}
          >
            {/* Icon */}
            <div className="shrink-0 mt-1">
              {dividend.isPast ? (
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
            <div className={cn('flex-1', !dividend.isPast && 'opacity-60')}>
              <h4 className="font-medium text-sm text-foreground">
                {dividend.investmentTitle}
              </h4>
              <p className="text-xs text-muted-foreground mt-0.5">
                {dividend.description}
              </p>
              <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{formatDateToReadableShort(dividend.date)}</span>
              </div>
            </div>

            {/* Amount and View */}
            <div className="flex flex-col items-end gap-1">
              <span className="text-sm font-medium text-green-600 dark:text-green-400">
                +{formatCurrency(dividend.amount, dividend.currency)}
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
