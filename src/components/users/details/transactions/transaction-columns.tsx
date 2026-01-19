'use client';

import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { MobileRow } from '@/components/shared/MobileCards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

// Transaction types
export interface Transaction {
  id: string;
  reference: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'investment' | 'dividend' | 'swap';
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  amount: number;
  currency: 'NGN' | 'USDT';
  description: string;
  created_at: string;
  source?: string;
  destination?: string;
}

// Status color helper
const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 dark:text-green-400';
    case 'pending':
      return 'text-orange-600 dark:text-orange-400';
    case 'failed':
      return 'text-red-600 dark:text-red-400';
    case 'cancelled':
      return 'text-muted-foreground';
    default:
      return 'text-muted-foreground';
  }
};

// Format currency
const formatCurrency = (amount: number, currency: 'NGN' | 'USDT') => {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
};

// Title case helper
const titleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Table columns
export const createTransactionColumns = (
  onViewDetails: (transaction: Transaction) => void
): Array<ExtendedColumnDef<Transaction>> => [
    {
      accessorKey: 'reference',
      header: 'Reference',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.reference}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className="font-medium capitalize">{row.original.type}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-foreground max-w-[200px] truncate block">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const isCredit = ['deposit', 'dividend'].includes(row.original.type);
        return (
          <span className={cn(
            'font-medium whitespace-nowrap',
            isCredit ? 'text-green-600 dark:text-green-400' : 'text-foreground'
          )}>
            {isCredit ? '+' : ''}{formatCurrency(row.original.amount, row.original.currency)}
          </span>
        );
      },
    },
    {
      accessorKey: 'currency',
      header: 'Currency',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.currency}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={cn(
            'text-sm font-medium capitalize whitespace-nowrap',
            getStatusColor(row.original.status)
          )}
        >
          {titleCase(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDateToReadableShort(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      meta: { className: 'w-[80px]' },
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => onViewDetails(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

// Mobile columns
export const transactionMobileColumns: Array<MobileRow<Transaction>> = [
  {
    cell: ({ row }) => (
      <span className={cn('text-xs font-medium capitalize', getStatusColor(row.status))}>
        {titleCase(row.status)}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.currency}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateToReadableShort(row.created_at)}
      </span>
    ),
    showBorder: false,
  },
];

// Mobile card title
export const getTransactionMobileTitle = (row: Transaction) => {
  const isCredit = ['deposit', 'dividend'].includes(row.type);
  return (
    <div className="flex flex-col">
      <span className="font-medium text-foreground capitalize">{row.type}</span>
      <span className={cn(
        'text-sm font-medium',
        isCredit ? 'text-green-600 dark:text-green-400' : 'text-foreground'
      )}>
        {isCredit ? '+' : ''}{formatCurrency(row.amount, row.currency)}
      </span>
    </div>
  );
};

// Mobile card action
export const TransactionMobileAction = ({
  row,
  onViewDetails,
}: {
  row: Transaction;
  onViewDetails: (transaction: Transaction) => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="text-primary hover:text-primary hover:bg-primary/10"
    onClick={() => onViewDetails(row)}
  >
    View
  </Button>
);

// Mobile card footer
export const getTransactionMobileFooter = ({ row }: { row: Transaction }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground truncate max-w-[70%]">
      {row.description}
    </span>
    <span className="font-mono text-muted-foreground text-[10px]">
      {row.reference}
    </span>
  </div>
);
