'use client';

import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import type { AllInvestmentTransactionsData, InvestmentCurrency } from '@/types/InvestmentTypes';
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

interface CofferTransactionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: AllInvestmentTransactionsData | null;
}

const formatCurrency = (amount: string | number, currency: InvestmentCurrency) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (currency === 'NGN') {
    return `₦${numAmount.toLocaleString()}`;
  }
  return `$${numAmount.toLocaleString()}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    case 'upcoming':
      return 'bg-muted text-muted-foreground';
    case 'failed':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getTypeLabel = (type: string) => {
  switch (type) {
    case 'deposit':
      return 'Investment Deposit';
    case 'dividend':
      return 'Dividend Payment';
    case 'withdrawal':
      return 'Withdrawal';
    case 'maturity':
      return 'Maturity Payout';
    default:
      return type;
  }
};

// Detail row component for consistent formatting
function DetailRow({ label, value, mono = false }: { label: string; value: string | undefined; mono?: boolean }) {
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

export default function CofferTransactionDetailsDialog({
  open,
  onOpenChange,
  transaction,
}: CofferTransactionDetailsDialogProps) {
  if (!transaction) return null;

  const isCredit = ['deposit', 'dividend', 'maturity'].includes(transaction.type);
  const isDebit = transaction.type === 'withdrawal';

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
            Transaction Details
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {getTypeLabel(transaction.type)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Amount and Status Header */}
        <div className="flex items-center justify-between py-4 px-4 bg-secondary/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Amount</p>
            <p className={cn(
              'text-2xl font-bold',
              isCredit && 'text-green-600 dark:text-green-400',
              isDebit && 'text-red-600 dark:text-red-400'
            )}>
              {isDebit ? '-' : '+'}{formatCurrency(transaction.amount, transaction.currency)}
            </p>
          </div>
          <span className={cn(
            'text-xs font-medium capitalize px-3 py-1.5 rounded-full',
            getStatusColor(transaction.status)
          )}>
            {transaction.status}
          </span>
        </div>

        <Separator />

        {/* Transaction Details */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Transaction Info
          </h3>
          <DetailRow label="Transaction ID" value={transaction.id} mono />
          <DetailRow label="Reference" value={transaction.reference} mono />
          <DetailRow label="Type" value={getTypeLabel(transaction.type)} />
          <DetailRow label="Status" value={transaction.status} />
          <DetailRow label="Currency" value={transaction.currency} />
          <DetailRow label="Amount" value={formatCurrency(transaction.amount, transaction.currency)} />
        </div>

        <Separator />

        {/* Investment Details */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Investment Info
          </h3>
          <DetailRow label="Investment" value={transaction.investment_name} />
        </div>

        <Separator />

        {/* Timestamps */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
            Timestamps
          </h3>
          <DetailRow label="Date" value={formatDateToReadableShort(transaction.date)} />
          <DetailRow label="Raw Timestamp" value={transaction.date} mono />
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
