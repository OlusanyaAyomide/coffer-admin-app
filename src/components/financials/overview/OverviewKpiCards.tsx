import { Activity, ArrowLeftRight, Landmark, TrendingUp } from 'lucide-react'
import { formatCompactMoney, formatPercent } from './financialsOverviewFormat'
import type { OverviewCurrency, OverviewKpis } from '@/types/FinancialsTypes'
import { StatCard } from '@/components/shared/StatCard'

type OverviewKpiCardsProps = {
  kpis: OverviewKpis
  currency: OverviewCurrency
}

/** Which currency leads the headline; the other rides the subline. NGN-first for an all view. */
function primaryCurrency(currency: OverviewCurrency): 'NGN' | 'USDT' {
  return currency === 'USDT' ? 'USDT' : 'NGN'
}

export default function OverviewKpiCards({
  kpis,
  currency,
}: OverviewKpiCardsProps) {
  const primary = primaryCurrency(currency)
  const secondary = primary === 'NGN' ? 'USDT' : 'NGN'
  const showSecondary = currency === 'all'

  const coverage = kpis.treasury_balance.coverage_ratio
  const coverageHealthy = coverage !== null && coverage >= 1
  const successRate = kpis.throughput.success_rate
  const throughputHealthy = successRate !== null && successRate >= 0.95

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Total Volume"
        icon={ArrowLeftRight}
        accentClassName="bg-primary"
        value={formatCompactMoney(kpis.total_volume[primary], primary)}
        subValue={
          showSecondary
            ? `+ ${formatCompactMoney(kpis.total_volume[secondary], secondary)} ${secondary}`
            : 'Deposits, withdrawals, swaps & transfers'
        }
      />

      <StatCard
        title="Net Revenue"
        icon={TrendingUp}
        accentClassName="bg-emerald-500"
        value={formatCompactMoney(kpis.net_revenue[primary], primary)}
        subValue={`${kpis.net_revenue.take_rate_bps} bps take rate${
          showSecondary
            ? ` · ${formatCompactMoney(kpis.net_revenue[secondary], secondary)} ${secondary}`
            : ''
        }`}
      />

      <StatCard
        title="Treasury Coverage"
        icon={Landmark}
        accentClassName={coverageHealthy ? 'bg-emerald-500' : 'bg-amber-500'}
        value={formatPercent(coverage)}
        subValue="Treasury assets vs user liability"
        subValueClassName={coverageHealthy ? undefined : 'text-amber-600'}
      />

      <StatCard
        title="Success Rate"
        icon={Activity}
        accentClassName={throughputHealthy ? 'bg-emerald-500' : 'bg-amber-500'}
        value={formatPercent(successRate)}
        subValue={`${kpis.throughput.completed.toLocaleString()} completed · ${kpis.throughput.failed.toLocaleString()} failed`}
        subValueClassName={throughputHealthy ? undefined : 'text-amber-600'}
      />
    </div>
  )
}
