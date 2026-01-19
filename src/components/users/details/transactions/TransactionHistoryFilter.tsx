import { Filter } from 'lucide-react';
import useTransactionHistoryContext from './useTransactionHistoryContext';
import FilterButtons from '@/components/shared/FilterButtons';
import DateFilterButtons from '@/components/shared/DateFilter';
import { Button } from '@/components/ui/button';

const transactionTypeOptions = [
  { label: 'Deposit', value: 'deposit' },
  { label: 'Withdrawal', value: 'withdrawal' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Investment', value: 'investment' },
  { label: 'Dividend', value: 'dividend' },
  { label: 'Swap', value: 'swap' },
];

const transactionStatusOptions = [
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Cancelled', value: 'cancelled' },
];

const currencyOptions = [
  { label: 'NGN (Naira)', value: 'NGN' },
  { label: 'USDT', value: 'USDT' },
];

export default function TransactionHistoryFilter({ className }: { className?: string }) {
  const {
    setPage,
    transactionType, setTransactionType,
    transactionStatus, setTransactionStatus,
    currency, setCurrency,
    duration, setDuration,
  } = useTransactionHistoryContext();

  const ResetFilter = () => {
    setTransactionType([]);
    setTransactionStatus([]);
    setCurrency([]);
    setDuration([]);
    setPage(1);
  };

  const totalFilters = [
    transactionType.length,
    transactionStatus.length,
    currency.length,
    duration.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className={`${className} flex flex-wrap gap-2 pt-1 py-2`}>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
        {totalFilters > 0 && (
          <span className="h-5 w-5 shrink-0 flex items-center justify-center text-xs text-white rounded-full bg-primary">
            {totalFilters}
          </span>
        )}

        <FilterButtons
          title="Type"
          filterKey="transaction_type"
          filterOptions={transactionTypeOptions}
          activeFilters={transactionType}
          setActiveFilters={setTransactionType}
        />

        <FilterButtons
          title="Status"
          filterKey="transaction_status"
          filterOptions={transactionStatusOptions}
          activeFilters={transactionStatus}
          setActiveFilters={setTransactionStatus}
        />

        <FilterButtons
          title="Currency"
          filterKey="currency"
          filterOptions={currencyOptions}
          activeFilters={currency}
          setActiveFilters={setCurrency}
        />

        <DateFilterButtons
          title="Duration"
          filterKey="duration"
          activeFilters={duration}
          setActiveFilters={setDuration}
        />

        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={ResetFilter}
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
