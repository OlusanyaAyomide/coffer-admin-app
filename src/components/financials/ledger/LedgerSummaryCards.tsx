import { CheckCircle2, Clock, Receipt, XCircle } from 'lucide-react'
import { formatCompactMoney } from '../overview/financialsOverviewFormat'
import type { LedgerSummary } from '@/types/FinancialsTypes'
import { StatCard } from '@/components/shared/StatCard'

type LedgerSummaryCardsProps = {
  summary: LedgerSummary | null
}

/**
 * Totals for the current filter set, across all pages. Counts are unambiguous; the volume
 * subline on the total card leads with NGN for this NGN-heavy book (USDT alongside).
 */
export default function LedgerSummaryCards({
  summary,
}: LedgerSummaryCardsProps) {
  if (!summary) return null

  const { by_status: status } = summary
  const ngn = summary.by_currency.find((c) => c.currency === 'NGN')
  const usdt = summary.by_currency.find((c) => c.currency === 'USDT')

  const completedPct =
    status.total > 0
      ? `${Math.round((status.completed / status.total) * 100)}% of total`
      : undefined

  const volumeLine = [
    ngn ? formatCompactMoney(ngn.volume, 'NGN') : null,
    usdt ? formatCompactMoney(usdt.volume, 'USDT') : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
      <StatCard
        title="Transactions"
        icon={Receipt}
        accentClassName="bg-primary"
        value={status.total.toLocaleString()}
        subValue={volumeLine || 'No volume in range'}
      />
      <StatCard
        title="Completed"
        icon={CheckCircle2}
        accentClassName="bg-emerald-500"
        value={status.completed.toLocaleString()}
        subValue={completedPct}
      />
      <StatCard
        title="Pending"
        icon={Clock}
        accentClassName="bg-amber-500"
        value={status.pending.toLocaleString()}
        subValue={status.pending > 0 ? 'Awaiting settlement' : 'None pending'}
        subValueClassName={status.pending > 0 ? 'text-amber-600' : undefined}
      />
      <StatCard
        title="Failed"
        icon={XCircle}
        accentClassName="bg-destructive"
        value={status.failed.toLocaleString()}
        subValue={
          status.reversed > 0
            ? `+ ${status.reversed} reversed`
            : 'Failed or reversed'
        }
        subValueClassName={status.failed > 0 ? 'text-destructive' : undefined}
      />
    </div>
  )
}
