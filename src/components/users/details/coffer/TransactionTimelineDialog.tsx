'use client';

import { CheckCircle2, Circle, Clock, X } from 'lucide-react';
import type { CofferInvestment, TransactionEvent } from './coffer-columns';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

interface TransactionTimelineDialogProps {
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

const getEventIcon = (status: TransactionEvent['status']) => {
  if (status === 'completed') {
    return (
      <div className="h-6 w-6 rounded-full bg-primary border-2 border-background shadow-sm flex items-center justify-center">
        <CheckCircle2 className="h-4 w-4 text-white" />
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className="h-6 w-6 rounded-full bg-orange-500 border-2 border-background shadow-sm flex items-center justify-center">
        <Clock className="h-4 w-4 text-white" />
      </div>
    );
  }
  return (
    <div className="h-6 w-6 rounded-full bg-muted border-2 border-background shadow-sm flex items-center justify-center">
      <Circle className="h-4 w-4 text-muted-foreground" />
    </div>
  );
};

const getEventLabel = (type: TransactionEvent['type']) => {
  switch (type) {
    case 'deposit':
      return 'Investment Started';
    case 'dividend':
      return 'Dividend Paid';
    case 'withdrawal':
      return 'Withdrawal';
    case 'maturity':
      return 'Investment Matured';
    default:
      return type;
  }
};

export default function TransactionTimelineDialog({
  open,
  onOpenChange,
  investment,
}: TransactionTimelineDialogProps) {
  if (!investment) return null;

  const sortedTransactions = [...investment.transactions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Build deposits/withdrawals data
  const depositsWithdrawals = [
    // Initial deposit
    {
      id: 'deposit-initial',
      date: formatDateToReadableShort(investment.created_at),
      type: 'Deposit' as const,
      units: `${investment.total_units_purchased} units`,
      pricePerUnit: formatCurrency(investment.investment.price_per_unit, investment.investment.currency),
      amount: `+${formatCurrency(investment.total_units_purchased * investment.investment.price_per_unit, investment.investment.currency)}`,
      typeClass: 'text-green-600 dark:text-green-400',
      dotClass: 'bg-green-500',
    },
    // Withdrawals
    ...investment.transactions
      .filter((event) => event.type === 'withdrawal')
      .map((event) => ({
        id: event.id,
        date: formatDateToReadableShort(event.date),
        type: 'Withdrawal' as const,
        units: '—',
        pricePerUnit: '—',
        amount: `-${formatCurrency(event.amount, investment.investment.currency)}`,
        typeClass: 'text-red-600 dark:text-red-400',
        dotClass: 'bg-red-500',
      })),
    // Maturity payout
    ...investment.transactions
      .filter((event) => event.type === 'maturity' && event.status === 'completed')
      .map((event) => ({
        id: event.id,
        date: formatDateToReadableShort(event.date),
        type: 'Maturity Payout' as const,
        units: `${investment.total_units_purchased} units`,
        pricePerUnit: formatCurrency(investment.investment.price_per_unit, investment.investment.currency),
        amount: `+${formatCurrency(event.amount, investment.investment.currency)}`,
        typeClass: 'text-primary',
        dotClass: 'bg-primary',
      })),
  ];

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
          <AlertDialogTitle className="text-xl">
            Transaction Timeline
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {investment.investment.title} • {investment.reference}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Timeline Section */}
        <div className="py-4">
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          <div className="relative pl-2">
            {/* Vertical Line */}
            <div className="absolute left-[18px] top-3 bottom-3 w-[2px] bg-border/60"></div>

            {sortedTransactions.map((event, index) => (
              <div
                key={event.id}
                className={cn(
                  'relative flex gap-4',
                  index !== sortedTransactions.length - 1 && 'mb-6'
                )}
              >
                <div className="relative z-10">
                  {getEventIcon(event.status)}
                </div>
                <div
                  className={cn(
                    'flex-1 pt-0.5',
                    event.status === 'upcoming' && 'opacity-50'
                  )}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-sm text-foreground">
                        {getEventLabel(event.type)}
                      </h4>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {event.type !== 'deposit' && event.amount > 0 && (
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        +{formatCurrency(event.amount, investment.investment.currency)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground bg-secondary/30 w-fit px-2 py-1 rounded-md">
                    <Clock className="h-3 w-3" />
                    <span>
                      {event.status === 'upcoming'
                        ? `Expected: ${formatDateToReadableShort(event.date)}`
                        : formatDateToReadableShort(event.date)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Deposits & Withdrawals Table */}
        <div className="py-4">
          <h3 className="text-lg font-semibold mb-4">Deposits & Withdrawals</h3>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Units</TableHead>
                  <TableHead className="font-semibold">Price/Unit</TableHead>
                  <TableHead className="font-semibold text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {depositsWithdrawals.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-muted-foreground">{row.date}</TableCell>
                    <TableCell>
                      <span className={cn('inline-flex items-center gap-1.5 font-medium', row.typeClass)}>
                        <span className={cn('h-2 w-2 rounded-full', row.dotClass)}></span>
                        {row.type}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{row.units}</TableCell>
                    <TableCell className="text-muted-foreground">{row.pricePerUnit}</TableCell>
                    <TableCell className={cn('text-right font-medium', row.typeClass)}>{row.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
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
