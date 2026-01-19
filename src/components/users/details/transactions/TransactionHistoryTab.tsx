'use client';

import { useState } from 'react';
import {
  
  createTransactionColumns,
  getTransactionMobileFooter,
  getTransactionMobileTitle,
  transactionMobileColumns
} from './transaction-columns';
import TransactionHistoryFilter from './TransactionHistoryFilter';
import TransactionDetailsDialog from './TransactionDetailsDialog';
import useTransactionHistoryContext from './useTransactionHistoryContext';
import type {Transaction} from './transaction-columns';
import { Button } from '@/components/ui/button';
import MobileCards from '@/components/shared/MobileCards';
import CustomizableTable from '@/components/shared/CustomizableTable';
import { convertDateToTimeRange } from '@/services/TimeServices';

// Mock transaction data
const mockTransactions: Array<Transaction> = [
  {
    id: '1',
    reference: 'TXN-2025-001',
    type: 'deposit',
    status: 'completed',
    amount: 50000,
    currency: 'NGN',
    description: 'Bank deposit via Paystack',
    created_at: '2025-01-15T10:30:00Z',
    source: 'Bank Transfer',
    destination: 'Fiat Wallet',
  },
  {
    id: '2',
    reference: 'TXN-2025-002',
    type: 'investment',
    status: 'completed',
    amount: 5000,
    currency: 'USDT',
    description: 'Investment in Agricultural Growth Fund',
    created_at: '2025-01-14T14:20:00Z',
    source: 'Crypto Wallet',
    destination: 'Investment Wallet',
  },
  {
    id: '3',
    reference: 'TXN-2025-003',
    type: 'dividend',
    status: 'completed',
    amount: 225,
    currency: 'USDT',
    description: 'Q4 2024 dividend from Agricultural Fund',
    created_at: '2025-01-10T09:00:00Z',
    source: 'Investment Wallet',
    destination: 'Crypto Wallet',
  },
  {
    id: '4',
    reference: 'TXN-2025-004',
    type: 'withdrawal',
    status: 'pending',
    amount: 100000,
    currency: 'NGN',
    description: 'Withdrawal to bank account',
    created_at: '2025-01-09T16:45:00Z',
    source: 'Fiat Wallet',
    destination: 'Bank Account',
  },
  {
    id: '5',
    reference: 'TXN-2025-005',
    type: 'swap',
    status: 'completed',
    amount: 1000,
    currency: 'USDT',
    description: 'Swap USDT to NGN',
    created_at: '2025-01-08T11:15:00Z',
    source: 'Crypto Wallet',
    destination: 'Fiat Wallet',
  },
  {
    id: '6',
    reference: 'TXN-2025-006',
    type: 'transfer',
    status: 'completed',
    amount: 25000,
    currency: 'NGN',
    description: 'Transfer to John Doe',
    created_at: '2025-01-07T08:30:00Z',
    source: 'Fiat Wallet',
    destination: 'External User',
  },
  {
    id: '7',
    reference: 'TXN-2025-007',
    type: 'deposit',
    status: 'failed',
    amount: 500,
    currency: 'USDT',
    description: 'Crypto deposit failed - insufficient gas',
    created_at: '2025-01-06T20:00:00Z',
    source: 'External Wallet',
    destination: 'Crypto Wallet',
  },
  {
    id: '8',
    reference: 'TXN-2024-098',
    type: 'withdrawal',
    status: 'cancelled',
    amount: 200000,
    currency: 'NGN',
    description: 'Withdrawal cancelled by user',
    created_at: '2024-12-28T13:20:00Z',
    source: 'Fiat Wallet',
    destination: 'Bank Account',
  },
];

export default function TransactionHistoryTab() {
  const {
    transactionType,
    transactionStatus,
    currency,
    duration,
    page,
    setPage,
  } = useTransactionHistoryContext();

  // Dialog state for transaction details
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Convert date filter to range
  const dateRange = duration.length > 0 ? convertDateToTimeRange('duration', duration) : null;

  // Filter data
  const filteredData = mockTransactions.filter((transaction) => {
    // Type filter
    if (transactionType.length > 0 && !transactionType.includes(transaction.type)) {
      return false;
    }

    // Status filter
    if (transactionStatus.length > 0 && !transactionStatus.includes(transaction.status)) {
      return false;
    }

    // Currency filter
    if (currency.length > 0 && !currency.includes(transaction.currency)) {
      return false;
    }

    // Date range filter
    if (dateRange) {
      const transactionDate = new Date(transaction.created_at);
      if (dateRange.duration_start && transactionDate < new Date(dateRange.duration_start)) return false;
      if (dateRange.duration_end && transactionDate > new Date(dateRange.duration_end)) return false;
    }

    return true;
  });

  // Handlers
  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  // Create columns with handlers
  const columns = createTransactionColumns(handleViewDetails);

  // Mobile action wrapper
  const MobileAction = ({ row }: { row: Transaction }) => (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary hover:bg-primary/10"
      onClick={() => handleViewDetails(row)}
    >
      View
    </Button>
  );

  // Pagination meta (mock)
  const paginationMeta = {
    total: filteredData.length,
    page: page,
    limit: 10,
    total_page: Math.ceil(filteredData.length / 10),
    has_next_page: page < Math.ceil(filteredData.length / 10),
    has_previous_page: page > 1,
  };

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <CustomizableTable
        tableKey="transaction-history-table"
        defaultVisibleColumns={[
          'reference',
          'type',
          'description',
          'amount',
          'status',
          'created_at',
          'action',
        ]}
        columns={columns}
        data={filteredData}
        meta={paginationMeta}
        setPage={setPage}
      >
        <TransactionHistoryFilter />
      </CustomizableTable>

      {/* Mobile Cards */}
      <MobileCards
        data={filteredData}
        columns={transactionMobileColumns}
        title={getTransactionMobileTitle}
        action={MobileAction}
        footer={getTransactionMobileFooter}
        meta={paginationMeta}
        setPage={setPage}
        testIdKey="id"
      />

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        transaction={selectedTransaction}
      />
    </div>
  );
}
