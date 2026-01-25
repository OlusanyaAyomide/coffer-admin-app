'use client';

import { useState } from 'react';
import { CheckCircle2, Circle, Clock, X } from 'lucide-react';
import type { InvestmentCurrency, InvestmentTransactionData, InvestmentTransactionsResponse } from '@/types/InvestmentTypes';
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
import { Skeleton } from '@/components/ui/skeleton';
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
import useGetRequest from '@/hooks/useGetRequests';

interface TransactionTimelineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  investmentId: string | null;
}

const formatCurrency = (amount: string | number, currency: InvestmentCurrency) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (currency === 'NGN') {
    return `₦${numAmount.toLocaleString()}`;
  }
  return `$${numAmount.toLocaleString()}`;
};

const getEventIcon = (status: string) => {
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

const getEventLabel = (type: string) => {
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

const getTypeColor = (type: string) => {
  switch (type) {
    case 'deposit':
      return { text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' };
    case 'withdrawal':
      return { text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' };
    case 'dividend':
      return { text: 'text-primary', dot: 'bg-primary' };
    case 'maturity':
      return { text: 'text-primary', dot: 'bg-primary' };
    default:
      return { text: 'text-foreground', dot: 'bg-muted-foreground' };
  }
};

export default function TransactionTimelineDialog({
  open,
  onOpenChange,
  userId,
  investmentId,
}: TransactionTimelineDialogProps) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useGetRequest<InvestmentTransactionsResponse, Error>({
    URL: `/admin/customer/${userId}/investments/${investmentId}/transactions`,
    queryKey: ['investment-transactions', userId, investmentId ?? '', String(page)],
    params: { page, limit: 20 },
    enabled: open && !!investmentId,
  });

  const investment = data?.data?.investment;
  const transactions = data?.data?.transactions ?? [];
  const meta = data?.data?.meta;

  // Transactions already sorted by server (earliest first, latest last)

  // Build deposits/withdrawals table data
  const getTableData = (txns: Array<InvestmentTransactionData>, currency: InvestmentCurrency) => {
    return txns.map((tx) => {
      const colors = getTypeColor(tx.type);
      const isWithdrawal = tx.type === 'withdrawal';
      return {
        id: tx.id,
        date: formatDateToReadableShort(tx.date),
        type: tx.type.charAt(0).toUpperCase() + tx.type.slice(1),
        amount: `${isWithdrawal ? '-' : '+'}${formatCurrency(tx.amount, currency)}`,
        typeClass: colors.text,
        dotClass: colors.dot,
      };
    });
  };

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
            {isLoading ? (
              <Skeleton className="h-4 w-48" />
            ) : investment ? (
              `${investment.title} • ${investment.reference}`
            ) : (
              'Loading...'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ? (
          <div className="py-4 space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
            <Separator />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : isError || !data?.data ? (
          <div className="py-8 text-center text-muted-foreground">
            Failed to load transactions.
          </div>
        ) : transactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No transactions found for this investment.
          </div>
        ) : (
          <>
            {/* Timeline Section */}
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4">Timeline</h3>
              <div className="relative pl-2">
                {/* Vertical Line */}
                <div className="absolute left-[18px] top-3 bottom-3 w-[2px] bg-border/60"></div>

                {transactions.map((event, index) => (
                  <div
                    key={event.id}
                    className={cn(
                      'relative flex gap-4',
                      index !== transactions.length - 1 && 'mb-6'
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
                        {event.type !== 'deposit' && parseFloat(event.amount) > 0 && (
                          <span className="text-sm font-medium text-green-600 dark:text-green-400">
                            +{formatCurrency(event.amount, event.currency)}
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

            {/* Activity Table */}
            <div className="py-4">
              <h3 className="text-lg font-semibold mb-4">Activity</h3>
              <div className="rounded-lg border border-border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Type</TableHead>
                      <TableHead className="font-semibold text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getTableData(transactions, transactions[0]?.currency ?? 'NGN').map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="text-muted-foreground">{row.date}</TableCell>
                        <TableCell>
                          <span className={cn('inline-flex items-center gap-1.5 font-medium', row.typeClass)}>
                            <span className={cn('h-2 w-2 rounded-full', row.dotClass)}></span>
                            {row.type}
                          </span>
                        </TableCell>
                        <TableCell className={cn('text-right font-medium', row.typeClass)}>{row.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {meta && meta.total_page > 1 && (
                <div className="flex justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.has_previous_page}
                    onClick={() => setPage((p) => p - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground self-center">
                    Page {meta.page} of {meta.total_page}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!meta.has_next_page}
                    onClick={() => setPage((p) => p + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </div>
          </>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline">Close</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
