'use client';

import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import type { SingleTransactionResponse, TransactionHistoryItem } from '@/types/UserTypes';
import type { QueryError } from '@/types/ResponseTypes';
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
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import { Skeleton } from '@/components/ui/skeleton';
import useGetRequest from '@/hooks/useGetRequests';

interface TransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionHistoryItem | null;
  userId: string;
}

const formatCurrency = (amount: string, currency: string) => {
  const numAmount = parseFloat(amount);
  const currencySymbol = currency === 'NGN' ? '₦' : '$';
  return `${currencySymbol}${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'cancelled':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

// Detail row component
function DetailRow({ label, value, mono = false }: { label: string; value: string | undefined | null; mono?: boolean }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (value) {
      navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!value) return null;

  return (
    <div className="flex items-start justify-between py-2 border-b border-border/50 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={cn('text-sm font-medium text-right', mono && 'font-mono text-xs')}>
          {value}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-muted-foreground" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default function TransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
  userId,
}: TransactionDetailsDialogProps) {
  // Fetch full details when dialog is open
  const { data, isLoading } = useGetRequest<SingleTransactionResponse, QueryError>({
    URL: `/admin/customer/${userId}/transactions/${transaction?.id}`,
    queryKey: ['admin-transaction-detail', userId, transaction?.id || ''],
    enabled: open && !!transaction?.id,
  });

  if (!transaction) return null;

  const details = data?.data;
  const isCredit = transaction.direction === 'credit';

  // Use base transaction info if details loading
  const displayData = details || transaction;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
            {displayData.reference}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Transaction Details
          </AlertDialogDescription>
        </AlertDialogHeader>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            {/* Amount and Status Header */}
            <div className="flex items-center justify-between py-4 px-4 bg-secondary/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount</p>
                <p className={cn(
                  'text-2xl font-bold',
                  isCredit ? 'text-green-600 dark:text-green-400' : 'text-foreground'
                )}>
                  {isCredit ? '+' : ''}{formatCurrency(displayData.amount, displayData.currency)}
                </p>
              </div>
              <span className={cn(
                'text-xs font-medium capitalize px-3 py-1.5 rounded-full',
                getStatusColor(displayData.status)
              )}>
                {displayData.status}
              </span>
            </div>

            <Separator />

            {/* Basic Info */}
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                Information
              </h3>
              <DetailRow label="ID" value={displayData.id} mono />
              <DetailRow label="Category" value={displayData.category?.replace('_', ' ')} />
              <DetailRow label="Description" value={displayData.description} />
              <DetailRow label="Wallet Type" value={displayData.wallet_type} />
              <DetailRow label="Date" value={formatDateToReadableShort(displayData.created_at)} />
            </div>

            {/* Rate info if swap */}
            {details?.rate && (
              <>
                <Separator />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Exchange Details
                  </h3>
                  <DetailRow label="Rate" value={details.rate} />
                </div>
              </>
            )}

            {/* Flow Details (Entries) */}
            {details?.entries && details.entries.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Flow Details
                  </h3>
                  <div className="border rounded-md divide-y">
                    {details.entries.map((entry) => (
                      <div key={entry.id} className="p-3 text-sm flex justify-between items-center bg-card">
                        <div className="flex flex-col gap-1">
                          <span className={cn(
                            "font-medium",
                            entry.direction === 'credit' ? "text-green-600" : "text-red-500"
                          )}>
                            {entry.direction === 'credit' ? 'Credit' : 'Debit'} ({entry.currency})
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {entry.direction === 'credit' ? 'To: ' : 'From: '}
                            {entry.direction === 'credit' ? entry.destination_details : entry.source_details}
                          </span>
                        </div>
                        <span className="font-mono font-medium">
                          {formatCurrency(entry.amount, entry.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Charges */}
            {details?.charges && details.charges.length > 0 && (
              <>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Charges
                  </h3>
                  <div className="border rounded-md divide-y">
                    {details.charges.map((charge) => (
                      <div key={charge.id} className="p-3 text-sm flex justify-between items-center bg-card">
                        <span className="capitalize">{charge.type?.replace('_', ' ')}</span>
                        <span className="font-mono text-red-500">
                          -{formatCurrency(charge.amount, charge.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            {displayData.meta_data && Object.keys(displayData.meta_data).length > 0 && (
              <>
                <Separator />
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    Metadata
                  </h3>
                  <div className="bg-muted/30 p-3 rounded-md border border-border/50">
                    {Object.entries(displayData.meta_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 text-xs">
                        <span className="text-muted-foreground font-medium">{key}:</span>
                        <span className="font-mono truncate max-w-[200px]" title={String(value)}>
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </>
        )}

        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel asChild>
            <Button variant="outline">Close</Button>
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
