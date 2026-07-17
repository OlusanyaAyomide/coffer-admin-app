import { Link } from '@tanstack/react-router'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { formatFullMoney } from './financialsOverviewFormat'
import type { OverviewResponse } from '@/types/FinancialsTypes'

type IntegrityAlertBannerProps = {
  data: OverviewResponse['data']
}

/**
 * The "is anything on fire" strip. Renders nothing when clean — a permanent green all-good bar
 * trains people to stop reading it. Draws only on signals already in the overview payload;
 * richer reconciliation checks arrive with the Phase 5 integrity service.
 */
export default function IntegrityAlertBanner({
  data,
}: IntegrityAlertBannerProps) {
  const alerts: Array<string> = []

  const shortfalls = data.treasury.coverage.filter(
    (c) => c.ratio !== null && c.ratio < 1,
  )
  for (const s of shortfalls) {
    alerts.push(
      `${s.currency} treasury covers only ${Math.round((s.ratio ?? 0) * 100)}% of user liability (shortfall ${formatFullMoney(s.shortfall, s.currency)})`,
    )
  }

  if (data.treasury.orphaned_wallets.length > 0) {
    const total = data.treasury.orphaned_wallets.length
    alerts.push(
      `${total} orphaned system ${total === 1 ? 'wallet holds' : 'wallets hold'} funds the app cannot reach`,
    )
  }

  if (data.treasury.missing_wallets.length > 0) {
    alerts.push(
      `${data.treasury.missing_wallets.length} expected system wallet(s) missing; settlement can throw mid-webhook`,
    )
  }

  const reconDrift = data.revenue.integrity.filter((r) => r.delta !== '0')
  for (const r of reconDrift) {
    alerts.push(
      `${r.currency} fee ledger and wallet balance disagree by ${formatFullMoney(r.delta, r.currency)}`,
    )
  }

  if (data.data_quality.zero_entry_completed_count > 0) {
    alerts.push(
      `${data.data_quality.zero_entry_completed_count} completed transaction(s) wrote no ledger entries`,
    )
  }

  if (alerts.length === 0) return null

  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-destructive">
              {alerts.length}{' '}
              {alerts.length === 1 ? 'issue needs' : 'issues need'} attention
            </p>
            <ul className="space-y-0.5 text-xs text-muted-foreground">
              {alerts.map((alert) => (
                <li key={alert}>{alert}</li>
              ))}
            </ul>
          </div>
        </div>
        <Link
          to="/financials/ledger"
          className="inline-flex items-center gap-1 text-xs font-medium text-destructive hover:underline"
        >
          Investigate
          <ArrowRight className="size-3" />
        </Link>
      </div>
    </div>
  )
}
