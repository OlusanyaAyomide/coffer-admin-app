import { useState } from 'react';
import {
  TransactionMobileAction,
  createTransactionColumns,
  getTransactionMobileFooter,
  getTransactionMobileTitle,
  transactionMobileColumns
} from './transaction-columns';
import TransactionHistoryFilter from './TransactionHistoryFilter';
import TransactionDetailsDialog from './TransactionDetailsDialog';
import useTransactionHistoryContext from './useTransactionHistoryContext';
import type { TransactionHistoryItem, TransactionHistoryResponse } from '@/types/UserTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import MobileCards from '@/components/shared/MobileCards';
import CustomizableTable from '@/components/shared/CustomizableTable';
import useGetRequest from '@/hooks/useGetRequests';
import { convertDateToTimeRange } from '@/services/TimeServices';
import { LONG_ITEMS_COUNT_PER_PAGE } from '@/constants/Constants';

interface TransactionHistoryTabProps {
  userId: string;
}

export default function TransactionHistoryTab({ userId }: TransactionHistoryTabProps) {
  const {
    transactionType,
    transactionStatus,
    currency,
    duration,
    page,
    setPage,
  } = useTransactionHistoryContext();

  // Dialog state for transaction details
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionHistoryItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Convert date filter to time range
  const dateRange = duration.length > 0 ? convertDateToTimeRange('duration', duration) : null;

  // Construct params object
  const params: Record<string, string | number | boolean | Array<string> | Array<number>> = {
    page,
    limit: LONG_ITEMS_COUNT_PER_PAGE,
  };

  if (transactionType.length > 0) params.category = transactionType;
  if (transactionStatus.length > 0) params.status = transactionStatus;
  if (currency.length > 0) params.currency = currency;
  if (dateRange?.duration_start) params.duration_start = dateRange.duration_start;
  if (dateRange?.duration_end) params.duration_end = dateRange.duration_end;

  // Fetch transactions from API
  const { data } = useGetRequest<TransactionHistoryResponse, QueryError>({
    URL: `/admin/customer/${userId}/transactions`,
    queryKey: ['admin-transaction-history', userId],
    params: params,
  });

  const transactions = data?.data?.data || [];
  const meta: PaginationType = data?.meta || {
    total: 0,
    page: 1,
    limit: LONG_ITEMS_COUNT_PER_PAGE,
    total_page: 1,
    has_next_page: false,
    has_previous_page: false,
  };

  console.log(data?.meta)
  // Handlers
  const handleViewDetails = (transaction: TransactionHistoryItem) => {
    setSelectedTransaction(transaction);
    setIsDetailsOpen(true);
  };

  // Create columns with handlers
  const columns = createTransactionColumns(handleViewDetails);

  // Mobile action wrapper
  const MobileAction = ({ row }: { row: TransactionHistoryItem }) => (
    <TransactionMobileAction row={row} onViewDetails={handleViewDetails} />
  );

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <CustomizableTable
        tableKey="transaction-history-table"
        defaultVisibleColumns={[
          'reference',
          'category',
          'description',
          'amount',
          'status',
          'created_at',
          'action',
        ]}
        columns={columns}
        data={transactions}
        meta={meta}
        setPage={setPage}
      >
        <TransactionHistoryFilter />
      </CustomizableTable>

      {/* Mobile Cards */}
      <MobileCards
        data={transactions}
        columns={transactionMobileColumns}
        title={getTransactionMobileTitle}
        action={MobileAction}
        footer={getTransactionMobileFooter}
        meta={meta}
        setPage={setPage}
        testIdKey="id"
      />

      {/* Transaction Details Dialog */}
      <TransactionDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        transaction={selectedTransaction}
        userId={userId}
      />
    </div>
  );
}
