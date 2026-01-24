'use client';

import { useState } from 'react';
import CofferTransactionDetailsDialog from './CofferTransactionDetailsDialog';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import CustomizableTable from '@/components/shared/CustomizableTable';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import useGetRequest from '@/hooks/useGetRequests';
import type { AllInvestmentTransactionsResponse, AllInvestmentTransactionsData, InvestmentCurrency } from '@/types/InvestmentTypes';
import { titleCase } from 'title-case';
import { titleCaseUnderscoreDash } from '@/services/TextServices';

interface CofferTransactionsOverviewProps {
  userId: string;
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
      return 'text-green-600 dark:text-green-400';
    case 'pending':
      return 'text-orange-600 dark:text-orange-400';
    case 'upcoming':
      return 'text-muted-foreground';
    case 'failed':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-muted-foreground';
  }
};

const getTypeColor = (type: string) => {
  switch (type) {
    case 'deposit':
      return 'text-green-600 dark:text-green-400';
    case 'withdrawal':
      return 'text-red-600 dark:text-red-400';
    case 'dividend':
      return 'text-primary';
    case 'maturity':
      return 'text-primary';
    default:
      return 'text-foreground';
  }
};

// Create columns for the coffer transactions table
const createCofferTransactionColumns = (
  onViewTransaction: (transaction: AllInvestmentTransactionsData) => void
): Array<ExtendedColumnDef<AllInvestmentTransactionsData>> => [
    {
      accessorKey: 'date',
      header: 'Date',
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap">
          {formatDateToReadableShort(row.original.date)}
        </span>
      ),
    },
    {
      accessorKey: 'investment',
      header: 'Investment',
      cell: ({ row }) => (
        <span className="font-medium text-foreground text-sm truncate max-w-[180px]">
          {titleCase(row.original.investment_name)}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className={cn('font-medium capitalize', getTypeColor(row.original.type))}>
          {titleCaseUnderscoreDash(row.original.type)}
        </span>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => (
        <span className="font-medium whitespace-nowrap">
          {row.original.type === 'withdrawal' ? '-' : '+'}
          {formatCurrency(row.original.amount, row.original.currency)}
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
          {row.original.status}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Action',
      meta: { className: 'w-[80px]' },
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => onViewTransaction(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

export default function CofferTransactionsOverview({
  userId,
}: CofferTransactionsOverviewProps) {
  const [page, setPage] = useState(1);
  const [selectedTransaction, setSelectedTransaction] = useState<AllInvestmentTransactionsData | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data, isLoading, isError } = useGetRequest<AllInvestmentTransactionsResponse, Error>({
    URL: `/admin/customer/${userId}/investment-transactions`,
    queryKey: ['all-investment-transactions', userId, String(page)],
    params: { page, limit: 10 },
  });

  const transactions = data?.data?.transactions ?? [];
  const paginationMeta = data?.data?.meta ?? {
    total: 0,
    page: 1,
    limit: 10,
    total_page: 1,
    has_next_page: false,
    has_previous_page: false,
  };

  const handleViewTransaction = (transaction: AllInvestmentTransactionsData) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  const columns = createCofferTransactionColumns(handleViewTransaction);

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border bg-card p-6 space-y-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Coffer Transactions Overview</h3>
        <p className="text-muted-foreground text-sm">Failed to load transactions.</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Coffer Transactions Overview</h3>
        <p className="text-muted-foreground text-sm">No transactions found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="px-1">
        <h3 className="text-lg font-semibold">Coffer Transactions Overview</h3>
        <p className="text-sm text-muted-foreground mt-1">
          Recent transactions across all coffer investments
        </p>
      </div>

      <CustomizableTable
        tableKey="coffer-transactions-overview"
        defaultVisibleColumns={[
          'date',
          'investment',
          'type',
          'amount',
          'status',
          'action',
        ]}
        columns={columns}
        data={transactions}
        meta={paginationMeta}
        setPage={setPage}
      >
        <span />
      </CustomizableTable>

      {/* Transaction Details Dialog */}
      <CofferTransactionDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}
