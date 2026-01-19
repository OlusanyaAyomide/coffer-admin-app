'use client';

import { MoreHorizontal } from 'lucide-react';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { MobileRow } from '@/components/shared/MobileCards';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

// Types based on UserInvestment schema
export interface TransactionEvent {
  id: string;
  type: 'deposit' | 'dividend' | 'withdrawal' | 'maturity';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'upcoming';
  description?: string;
}

export interface CofferInvestment {
  id: string;
  reference: string;
  status: 'active' | 'matured' | 'withdrawn' | 'cancelled' | 'not_started';
  total_units_purchased: number;
  created_at: string;
  investment: {
    id: string;
    title: string;
    category: string;
    price_per_unit: number;
    roi_percentage: number;
    start_date: string;
    maturity_date: string;
    currency: 'NGN' | 'USDT';
    description: string;
  };
  transactions: Array<TransactionEvent>;
  total_dividends_received: number;
  next_dividend_date?: string;
}

// Status color helper
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 dark:text-green-400';
    case 'matured':
      return 'text-primary';
    case 'withdrawn':
      return 'text-orange-600 dark:text-orange-400';
    case 'cancelled':
      return 'text-red-600 dark:text-red-400';
    case 'not_started':
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

// Actions component for table
interface CofferActionsProps {
  investment: CofferInvestment;
  onViewInvestment: (investment: CofferInvestment) => void;
  onViewTransactions: (investment: CofferInvestment) => void;
}

export const CofferActions = ({
  investment,
  onViewInvestment,
  onViewTransactions,
}: CofferActionsProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
        <span className="sr-only">Open menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuItem onClick={() => onViewInvestment(investment)}>
        View Investment
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => onViewTransactions(investment)}>
        View Transactions
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

// Table columns
export const createCofferColumns = (
  onViewInvestment: (investment: CofferInvestment) => void,
  onViewTransactions: (investment: CofferInvestment) => void
): Array<ExtendedColumnDef<CofferInvestment>> => [
    {
      accessorKey: 'investment_name',
      header: 'Investment Name',
      cell: ({ row }) => (
        <span className="font-medium text-foreground whitespace-nowrap">
          {row.original.investment.title}
        </span>
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
          {row.original.status.replace('_', ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'units_owned',
      header: 'Units Owned',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.total_units_purchased}</span>
      ),
    },
    {
      accessorKey: 'total_value',
      header: 'Total Value',
      cell: ({ row }) => {
        const total =
          row.original.total_units_purchased *
          row.original.investment.price_per_unit;
        return (
          <span className="font-medium whitespace-nowrap">
            {formatCurrency(total, row.original.investment.currency)}
          </span>
        );
      },
    },
    {
      accessorKey: 'roi',
      header: 'ROI',
      cell: ({ row }) => (
        <span className="text-green-600 dark:text-green-400 font-medium">
          {row.original.investment.roi_percentage}%
        </span>
      ),
    },
    {
      accessorKey: 'start_date',
      header: 'Start Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDateToReadableShort(row.original.investment.start_date)}
        </span>
      ),
    },
    {
      accessorKey: 'maturity_date',
      header: 'Maturity Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDateToReadableShort(row.original.investment.maturity_date)}
        </span>
      ),
    },
    {
      accessorKey: 'dividends_received',
      header: 'Dividends Received',
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">
          {formatCurrency(
            row.original.total_dividends_received,
            row.original.investment.currency
          )}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      meta: { className: 'w-[80px]' },
      cell: ({ row }) => (
        <CofferActions
          investment={row.original}
          onViewInvestment={onViewInvestment}
          onViewTransactions={onViewTransactions}
        />
      ),
    },
  ];

// Mobile columns
export const cofferMobileColumns: Array<MobileRow<CofferInvestment>> = [
  {
    cell: ({ row }) => (
      <span className={cn('text-xs font-medium capitalize', getStatusColor(row.status))}>
        {row.status.replace('_', ' ')}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {row.total_units_purchased} units
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs font-medium text-green-600 dark:text-green-400">
        {row.investment.roi_percentage}% ROI
      </span>
    ),
    showBorder: false,
  },
];

// Mobile card title
export const getCofferMobileTitle = (row: CofferInvestment) => (
  <div className="flex flex-col">
    <span className="font-medium text-foreground">{row.investment.title}</span>
    <span className="text-xs text-muted-foreground">{row.investment.category}</span>
  </div>
);

// Mobile card action
export const CofferMobileAction = ({
  row,
  onViewTransactions,
}: {
  row: CofferInvestment;
  onViewTransactions: (investment: CofferInvestment) => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="text-primary hover:text-primary hover:bg-primary/10"
    onClick={() => onViewTransactions(row)}
  >
    View
  </Button>
);

// Mobile card footer
export const getCofferMobileFooter = ({ row }: { row: CofferInvestment }) => {
  const total = row.total_units_purchased * row.investment.price_per_unit;
  return (
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">
        Value: {formatCurrency(total, row.investment.currency)}
      </span>
      <span className="text-muted-foreground">
        Maturity: {formatDateToReadableShort(row.investment.maturity_date)}
      </span>
    </div>
  );
};
