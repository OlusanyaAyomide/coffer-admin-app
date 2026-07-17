import { Filter } from 'lucide-react'
import useLedgerContext from './useLedgerContext'
import FilterButtons from '@/components/shared/FilterButtons'
import DateFilterButtons from '@/components/shared/DateFilter'
import { Button } from '@/components/ui/button'

const flowOptions = [
  { label: 'Deposit', value: 'deposit' },
  { label: 'Withdrawal', value: 'withdrawal' },
  { label: 'Swap', value: 'swap' },
  { label: 'Internal Transfer', value: 'internal_transfer' },
  { label: 'External Transfer', value: 'external_transfer' },
  { label: 'Locker', value: 'locker' },
  { label: 'Cabal', value: 'cabal' },
  { label: 'Investment', value: 'investment' },
  { label: 'Fee', value: 'fee' },
  { label: 'Unclassified', value: 'unknown' },
]

const statusOptions = [
  { label: 'Completed', value: 'completed' },
  { label: 'Pending', value: 'pending' },
  { label: 'Failed', value: 'failed' },
  { label: 'Reversed', value: 'reversed' },
]

const providerOptions = [
  { label: 'Busha', value: 'busha' },
  { label: 'PalmPay', value: 'palmpay' },
  { label: 'Yellow Card', value: 'yellow_card' },
  { label: 'Lenco', value: 'lenco' },
  { label: 'Paystack', value: 'paystack' },
  { label: 'Internal (no rail)', value: 'internal' },
  { label: 'Unknown', value: 'unknown' },
]

const currencyOptions = [
  { label: 'NGN (Naira)', value: 'NGN' },
  { label: 'USDT', value: 'USDT' },
]

/** Read-only detection surfaces, not data attributes — see Todo.md. */
const integrityOptions = [
  { label: 'No ledger entries', value: 'has_no_entries' },
  { label: 'Stuck pending', value: 'is_stuck' },
]

export default function LedgerFilters({ className }: { className?: string }) {
  const {
    setPage,
    flow,
    setFlow,
    status,
    setStatus,
    provider,
    setProvider,
    currency,
    setCurrency,
    duration,
    setDuration,
    integrity,
    setIntegrity,
  } = useLedgerContext()

  const handleReset = () => {
    setFlow([])
    setStatus([])
    setProvider([])
    setCurrency([])
    setDuration([])
    setIntegrity([])
    setPage(1)
  }

  const totalFilters = [
    flow.length,
    status.length,
    provider.length,
    currency.length,
    duration.length,
    integrity.length,
  ].reduce((a, b) => a + b, 0)

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
          title="Flow"
          filterKey="flow"
          filterOptions={flowOptions}
          activeFilters={flow}
          setActiveFilters={setFlow}
        />

        <FilterButtons
          title="Status"
          filterKey="status"
          filterOptions={statusOptions}
          activeFilters={status}
          setActiveFilters={setStatus}
        />

        <FilterButtons
          title="Rail"
          filterKey="provider"
          filterOptions={providerOptions}
          activeFilters={provider}
          setActiveFilters={setProvider}
        />

        <FilterButtons
          title="Currency"
          filterKey="currency"
          filterOptions={currencyOptions}
          activeFilters={currency}
          setActiveFilters={setCurrency}
        />

        <FilterButtons
          title="Integrity"
          filterKey="integrity"
          filterOptions={integrityOptions}
          activeFilters={integrity}
          setActiveFilters={setIntegrity}
        />

        <DateFilterButtons
          title="Duration"
          filterKey="duration"
          activeFilters={duration}
          setActiveFilters={setDuration}
        />

        {totalFilters > 0 && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  )
}
