'use client';

import { MoreHorizontal } from 'lucide-react';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { MobileRow } from '@/components/shared/MobileCards';
import type { InvestmentCurrency, UserInvestmentData, UserInvestmentStatus } from '@/types/InvestmentTypes';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

// Status color helper
const getStatusColor = (status: UserInvestmentStatus) => {
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
const formatCurrency = (amount: string | number, currency: InvestmentCurrency) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (currency === 'NGN') {
    return `₦${numAmount.toLocaleString()}`;
  }
  return `$${numAmount.toLocaleString()}`;
};

// Actions component for table
interface CofferActionsProps {
  investment: UserInvestmentData;
  onViewInvestment: (investment: UserInvestmentData) => void;
  onViewTransactions: (investment: UserInvestmentData) => void;
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
  onViewInvestment: (investment: UserInvestmentData) => void,
  onViewTransactions: (investment: UserInvestmentData) => void
): Array<ExtendedColumnDef<UserInvestmentData>> => [
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
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">
          {formatCurrency(row.original.total_value, row.original.investment.currency)}
        </span>
      ),
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
          {formatCurrency(row.original.dividends_received, row.original.investment.currency)}
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
export const cofferMobileColumns: Array<MobileRow<UserInvestmentData>> = [
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
export const getCofferMobileTitle = (row: UserInvestmentData) => (
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
  row: UserInvestmentData;
  onViewTransactions: (investment: UserInvestmentData) => void;
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
export const getCofferMobileFooter = ({ row }: { row: UserInvestmentData }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground">
      Value: {formatCurrency(row.total_value, row.investment.currency)}
    </span>
    <span className="text-muted-foreground">
      Maturity: {formatDateToReadableShort(row.investment.maturity_date)}
    </span>
  </div>
);
