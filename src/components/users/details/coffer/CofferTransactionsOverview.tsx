'use client';

import { useState } from 'react';
import CofferTransactionDetailsDialog from './CofferTransactionDetailsDialog';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { CofferInvestment, TransactionEvent } from './coffer-columns';
import CustomizableTable from '@/components/shared/CustomizableTable';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

interface CofferTransactionsOverviewProps {
  investments: Array<CofferInvestment>;
}

interface FlattenedTransaction extends TransactionEvent {
  investmentTitle: string;
  investmentRef: string;
  currency: 'NGN' | 'USDT';
  parentInvestment: CofferInvestment;
}

const formatCurrency = (amount: number, currency: 'NGN' | 'USDT') => {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString()}`;
  }
  return `$${amount.toLocaleString()}`;
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'completed':
      return 'text-green-600 dark:text-green-400';
    case 'pending':
      return 'text-orange-600 dark:text-orange-400';
    case 'upcoming':
      return 'text-muted-foreground';
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
  onViewTransaction: (transaction: FlattenedTransaction) => void
): Array<ExtendedColumnDef<FlattenedTransaction>> => [
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
          {row.original.investmentTitle}
        </span>
      ),
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ row }) => (
        <span className={cn('font-medium capitalize', getTypeColor(row.original.type))}>
          {row.original.type}
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
  investments,
}: CofferTransactionsOverviewProps) {
  // Dialog state
  const [selectedTransaction, setSelectedTransaction] = useState<FlattenedTransaction | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Flatten all transactions from all investments
  const allTransactions: Array<FlattenedTransaction> = [];

  investments.forEach((investment) => {
    investment.transactions.forEach((transaction) => {
      allTransactions.push({
        ...transaction,
        investmentTitle: investment.investment.title,
        investmentRef: investment.reference,
        currency: investment.investment.currency,
        parentInvestment: investment,
      });
    });
  });

  // Sort by date (most recent first)
  allTransactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Show only the most recent 10 transactions
  const recentTransactions = allTransactions.slice(0, 10);

  // Handler for viewing transaction
  const handleViewTransaction = (transaction: FlattenedTransaction) => {
    setSelectedTransaction(transaction);
    setIsDialogOpen(true);
  };

  // Create columns
  const columns = createCofferTransactionColumns(handleViewTransaction);

  // Pagination meta (mock for now)
  const paginationMeta = {
    total: recentTransactions.length,
    page: 1,
    limit: 10,
    total_page: 1,
    has_next_page: false,
    has_previous_page: false,
  };

  if (recentTransactions.length === 0) {
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
        data={recentTransactions}
        meta={paginationMeta}
        setPage={() => { }}
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
