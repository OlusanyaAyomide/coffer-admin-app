import { useState } from 'react'
import {
  LedgerMobileAction,
  createLedgerColumns,
  getLedgerMobileFooter,
  getLedgerMobileTitle,
  ledgerMobileColumns,
} from './ledger-columns'
import LedgerFilters from './LedgerFilters'
import LedgerSummaryCards from './LedgerSummaryCards'
import TransactionDetailSheet from './TransactionDetailSheet'
import useLedgerContext from './useLedgerContext'
import type { LedgerTransaction } from '@/types/FinancialsTypes'
import MobileCards from '@/components/shared/MobileCards'
import CustomizableTable from '@/components/shared/CustomizableTable'
import { TableSearch } from '@/components/shared/TableSearch'
import useFinancialsLedger from '@/hooks/useFinancialsLedger'
import { convertDateToTimeRange } from '@/services/TimeServices'

const DEFAULT_VISIBLE_COLUMNS = [
  'reference',
  'flow',
  'provider',
  'amount',
  'status',
  'user',
  'entry_count',
  'created_at',
  'action',
]

export default function LedgerPage() {
  const {
    flow,
    status,
    provider,
    currency,
    duration,
    integrity,
    search,
    setSearch,
    page,
    setPage,
  } = useLedgerContext()

  const [selectedTransaction, setSelectedTransaction] =
    useState<LedgerTransaction | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  const dateRange =
    duration.length > 0 ? convertDateToTimeRange('duration', duration) : null

  const { transactions, summary, ledgerMeta, isLedgerLoading } =
    useFinancialsLedger({
      page,
      flow,
      status,
      provider,
      currency,
      search,
      duration: dateRange
        ? {
            duration_start: dateRange.duration_start,
            duration_end: dateRange.duration_end,
          }
        : null,
      hasNoEntries: integrity.includes('has_no_entries'),
      isStuck: integrity.includes('is_stuck'),
    })

  const handleViewDetails = (transaction: LedgerTransaction) => {
    setSelectedTransaction(transaction)
    setIsDetailOpen(true)
  }

  const columns = createLedgerColumns(handleViewDetails)

  const MobileAction = ({ row }: { row: LedgerTransaction }) => (
    <LedgerMobileAction row={row} onViewDetails={handleViewDetails} />
  )

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Transaction Ledger
        </h1>
        <p className="text-sm text-muted-foreground">
          Every money movement across all users, rails and currencies.
        </p>
      </header>

      <LedgerSummaryCards summary={summary} />

      <TableSearch
        searchTerm={search}
        onSearchChange={(value: string) => {
          setSearch(value)
          setPage(1)
        }}
        placeholder="Search reference, provider reference, email or Coffer ID"
      />

      <CustomizableTable
        tableKey="financials-ledger"
        defaultVisibleColumns={DEFAULT_VISIBLE_COLUMNS}
        columns={columns}
        data={transactions}
        meta={ledgerMeta}
        setPage={setPage}
        isLoading={isLedgerLoading}
      >
        <LedgerFilters />
      </CustomizableTable>

      <MobileCards
        data={transactions}
        columns={ledgerMobileColumns}
        title={getLedgerMobileTitle}
        action={MobileAction}
        footer={getLedgerMobileFooter}
        meta={ledgerMeta}
        setPage={setPage}
        testIdKey="id"
      />

      <TransactionDetailSheet
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        transaction={selectedTransaction}
      />
    </div>
  )
}
