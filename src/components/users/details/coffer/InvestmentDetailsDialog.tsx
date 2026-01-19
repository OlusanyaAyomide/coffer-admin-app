'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Coins, Clock, Layers } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import type { CofferInvestment } from './coffer-columns';

interface InvestmentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investment: CofferInvestment | null;
}

const formatCurrency = (amount: number, currency: 'NGN' | 'USDT') => {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'matured':
      return 'bg-primary/10 text-primary';
    case 'withdrawn':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'cancelled':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'not_started':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function InvestmentDetailsDialog({
  open,
  onOpenChange,
  investment,
}: InvestmentDetailsDialogProps) {
  if (!investment) return null;

  const totalValue =
    investment.total_units_purchased * investment.investment.price_per_unit;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <AlertDialogTitle className="text-xl">
                {investment.investment.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground mt-1">
                {investment.investment.category}
              </AlertDialogDescription>
            </div>
            <Badge
              className={cn(
                'capitalize',
                getStatusColor(investment.status)
              )}
            >
              {investment.status.replace('_', ' ')}
            </Badge>
          </div>
        </AlertDialogHeader>

        <div className="py-4 space-y-4">
          {/* Investment Overview */}
          <p className="text-sm text-muted-foreground">
            {investment.investment.description}
          </p>

          <Separator />

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Coins className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Units Owned</p>
                <p className="font-semibold">{investment.total_units_purchased}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">ROI</p>
                <p className="font-semibold text-green-600">
                  {investment.investment.roi_percentage}%
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Layers className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Value</p>
                <p className="font-semibold">
                  {formatCurrency(totalValue, investment.investment.currency)}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30">
              <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center">
                <Coins className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Dividends Received</p>
                <p className="font-semibold">
                  {formatCurrency(
                    investment.total_dividends_received,
                    investment.investment.currency
                  )}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Dates */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Start Date</span>
              </div>
              <span className="text-sm font-medium">
                {formatDateToReadableShort(investment.investment.start_date)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Maturity Date</span>
              </div>
              <span className="text-sm font-medium">
                {formatDateToReadableShort(investment.investment.maturity_date)}
              </span>
            </div>
            {investment.next_dividend_date && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>Next Dividend</span>
                </div>
                <span className="text-sm font-medium text-primary">
                  {formatDateToReadableShort(investment.next_dividend_date)}
                </span>
              </div>
            )}
          </div>

          <Separator />

          {/* Reference */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Reference</span>
            <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
              {investment.reference}
            </span>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Close</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
