import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { MobileRow } from '@/components/shared/MobileCards';
import type { TransactionHistoryItem } from '@/types/UserTypes';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import handleOptionalData from '@/services/emptyDataServices';
import { formatDateToReadableShort } from '@/services/TimeServices';

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
const formatCurrency = (amount: string | number, currency: string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const currencySymbol = currency === 'NGN' ? '₦' : '$';
  return `${currencySymbol}${numAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

// Title case helper
const titleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Table columns
export const createTransactionColumns = (
  onViewDetails: (transaction: TransactionHistoryItem) => void
): Array<ExtendedColumnDef<TransactionHistoryItem>> => [
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
      accessorKey: 'category',
      header: 'Type',
      cell: ({ row }) => (
        <span className="font-medium capitalize">{row.original.category.replace('_', ' ')}</span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-foreground max-w-[200px] truncate block">
          {handleOptionalData(row.original.description)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => {
        const isCredit = row.original.direction === 'credit';
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
export const transactionMobileColumns: Array<MobileRow<TransactionHistoryItem>> = [
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
export const getTransactionMobileTitle = (row: TransactionHistoryItem) => {
  const isCredit = row.direction === 'credit';
  return (
    <div className="flex flex-col">
      <span className="font-medium text-foreground capitalize">{row.category.replace('_', ' ')}</span>
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
  row: TransactionHistoryItem;
  onViewDetails: (transaction: TransactionHistoryItem) => void;
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
export const getTransactionMobileFooter = ({ row }: { row: TransactionHistoryItem }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground truncate max-w-[70%]">
      {handleOptionalData(row.description)}
    </span>
    <span className="font-mono text-muted-foreground text-[10px]">
      {row.reference}
    </span>
  </div>
);
