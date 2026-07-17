import { Link } from '@tanstack/react-router'
import { ArrowRight, Info } from 'lucide-react'
import { FLOW_LABEL, formatFullMoney } from './financialsOverviewFormat'
import type { OverviewResponse } from '@/types/FinancialsTypes'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

type RevenueSummaryCardProps = {
  revenue: OverviewResponse['data']['revenue']
}

export default function RevenueSummaryCard({
  revenue,
}: RevenueSummaryCardProps) {
  const earners = revenue.take_rate_bps
    .filter((row) => Number(row.fees_earned) > 0)
    .sort((a, b) => Number(b.fees_earned) - Number(a.fees_earned))

  const gaps = revenue.gaps.items
    .filter((gap) => gap.flow === 'swap')
    .sort((a, b) => Number(b.gross_volume) - Number(a.gross_volume))

  return (
    <Card className="flex flex-col rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Revenue & take rate
        </CardTitle>
        <CardDescription className="text-xs">
          Fees Coffer keeps, by flow, with the effective take rate.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-4">
        {earners.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No fees earned in this period.
          </p>
        ) : (
          <ul className="space-y-2">
            {earners.map((row) => (
              <li
                key={`${row.flow}-${row.currency}`}
                className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {FLOW_LABEL[row.flow]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    on {formatFullMoney(row.gross_volume, row.currency)}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-sm font-semibold tabular-nums text-foreground">
                    {formatFullMoney(row.fees_earned, row.currency)}
                  </span>
                  <span className="text-xs font-medium text-emerald-600">
                    {row.bps} bps
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}

        {gaps.length > 0 ? (
          <div className="rounded-md border border-amber-300/50 bg-amber-50 px-3 py-2.5 dark:border-amber-900/50 dark:bg-amber-950/40">
            <div className="flex gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-amber-600" />
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-amber-800 dark:text-amber-300">
                  Uncaptured spread on swaps
                </p>
                {gaps.map((gap) => (
                  <p
                    key={gap.currency}
                    className="text-xs text-muted-foreground"
                  >
                    {formatFullMoney(gap.gross_volume, gap.currency)} swapped at
                    0 bps: about{' '}
                    {formatFullMoney(gap.foregone_estimate, gap.currency)}{' '}
                    foregone at {revenue.gaps.illustrative_spread_bps} bps.
                  </p>
                ))}
                <Link
                  to="/financials/provider-config"
                  className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 hover:underline dark:text-amber-400"
                >
                  Configure swap fee
                  <ArrowRight className="size-3" />
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
