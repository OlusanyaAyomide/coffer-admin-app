import { AlertTriangle } from 'lucide-react'
import {
  FLOW_LABELS,
  PROVIDER_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
  formatAmount,
  formatLatency,
} from './ledger-display'
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable'
import type { MobileRow } from '@/components/shared/MobileCards'
import type { LedgerTransaction } from '@/types/FinancialsTypes'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatDateToReadableShort } from '@/services/TimeServices'

/**
 * A transaction with no ledger entries recorded nothing in the double-entry ledger. For a
 * completed transaction that is a real defect, so the row is flagged rather than left to
 * look ordinary.
 */
function EntryCountCell({ transaction }: { transaction: LedgerTransaction }) {
  const isSuspicious =
    transaction.entry_count === 0 && transaction.status === 'completed'

  if (!isSuspicious) {
    return (
      <span className="text-sm text-muted-foreground">
        {transaction.entry_count}
      </span>
    )
  }

  return (
    <span
      className="inline-flex items-center gap-1 text-sm font-medium text-destructive"
      title="Completed, but wrote no ledger entries"
    >
      <AlertTriangle className="size-3.5" />0
    </span>
  )
}

export const createLedgerColumns = (
  onViewDetails: (transaction: LedgerTransaction) => void,
): Array<ExtendedColumnDef<LedgerTransaction>> => [
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
    accessorKey: 'flow',
    header: 'Flow',
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">
        {FLOW_LABELS[row.original.flow]}
      </span>
    ),
  },
  {
    accessorKey: 'provider',
    header: 'Rail',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {PROVIDER_LABELS[row.original.provider]}
      </span>
    ),
  },
  {
    accessorKey: 'amount',
    header: 'Amount',
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">
        {formatAmount(row.original.amount, row.original.base_currency)}
      </span>
    ),
  },
  {
    accessorKey: 'base_currency',
    header: 'Currency',
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        {row.original.base_currency ?? '—'}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={STATUS_BADGE_VARIANT[row.original.status]}>
        {STATUS_LABELS[row.original.status]}
      </Badge>
    ),
  },
  {
    accessorKey: 'user',
    header: 'User',
    cell: ({ row }) => {
      const { user } = row.original
      if (!user) {
        // Lenco deposits are written without a user_id — see Todo.md #22.
        return (
          <span className="text-xs text-muted-foreground italic">
            Unattributed
          </span>
        )
      }
      return (
        <div className="flex flex-col">
          <span className="text-sm text-foreground truncate max-w-[160px]">
            {user.email}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">
            {user.coffer_id}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'entry_count',
    header: 'Entries',
    meta: { className: 'w-[80px]' },
    cell: ({ row }) => <EntryCountCell transaction={row.original} />,
  },
  {
    accessorKey: 'charges_total',
    header: 'Charges',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground whitespace-nowrap">
        {formatAmount(row.original.charges_total, row.original.base_currency)}
      </span>
    ),
  },
  {
    accessorKey: 'settlement_latency_proxy',
    header: 'Settled in',
    cell: ({ row }) => (
      <span
        className="text-sm text-muted-foreground whitespace-nowrap"
        title="Approximate: derived from updated_at, which any later write inflates"
      >
        {formatLatency(row.original.settlement_latency_proxy)}
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
]

export const ledgerMobileColumns: Array<MobileRow<LedgerTransaction>> = [
  {
    cell: ({ row }) => (
      <Badge variant={STATUS_BADGE_VARIANT[row.status]}>
        {STATUS_LABELS[row.status]}
      </Badge>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {PROVIDER_LABELS[row.provider]}
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
]

export const getLedgerMobileTitle = (row: LedgerTransaction) => (
  <div className="flex flex-col">
    <span className="font-medium text-foreground">{FLOW_LABELS[row.flow]}</span>
    <span className="text-sm font-medium text-foreground">
      {formatAmount(row.amount, row.base_currency)}
    </span>
  </div>
)

export const LedgerMobileAction = ({
  row,
  onViewDetails,
}: {
  row: LedgerTransaction
  onViewDetails: (transaction: LedgerTransaction) => void
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="text-primary hover:text-primary hover:bg-primary/10"
    onClick={() => onViewDetails(row)}
  >
    View
  </Button>
)

export const getLedgerMobileFooter = ({ row }: { row: LedgerTransaction }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground truncate max-w-[70%]">
      {row.user?.email ?? 'Unattributed'}
    </span>
    <span className="font-mono text-muted-foreground text-[10px]">
      {row.reference}
    </span>
  </div>
)
