import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import {
  formatCompactMoney,
  formatFullMoney,
  formatPercent,
} from './financialsOverviewFormat'
import type { OverviewResponse } from '@/types/FinancialsTypes'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type TreasuryCoverageCardProps = {
  treasury: OverviewResponse['data']['treasury']
}

const WALLET_LABEL: Record<string, string> = {
  treasury: 'Treasury',
  system_fee: 'Revenue',
  processor_fee: 'Processor',
  vat_charges: 'VAT',
}

function CoverageBar({ ratio }: { ratio: number | null }) {
  // Cap the fill at 100% so a healthy surplus doesn't overflow the track; the number carries
  // the true figure.
  const pct = ratio === null ? 0 : Math.min(ratio, 1) * 100
  const healthy = ratio !== null && ratio >= 1
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={cn(
          'h-full rounded-full',
          healthy ? 'bg-emerald-500' : 'bg-amber-500',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

export default function TreasuryCoverageCard({
  treasury,
}: TreasuryCoverageCardProps) {
  return (
    <Card className="flex flex-col rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Treasury position
          </CardTitle>
          <Link
            to="/financials/internal"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Details
            <ArrowRight className="size-3" />
          </Link>
        </div>
        <CardDescription className="text-xs">
          What the company holds against what it owes users.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 pt-4">
        <div className="space-y-3">
          {treasury.coverage.map((row) => {
            const healthy = row.ratio !== null && row.ratio >= 1
            return (
              <div key={row.currency} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {row.currency}
                  </span>
                  <span
                    className={cn(
                      'font-semibold tabular-nums',
                      healthy ? 'text-emerald-600' : 'text-amber-600',
                    )}
                  >
                    {formatPercent(row.ratio, 0)} covered
                  </span>
                </div>
                <CoverageBar ratio={row.ratio} />
                <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
                  <span>
                    {formatFullMoney(row.treasury_balance, row.currency)} held
                  </span>
                  <span>
                    {formatFullMoney(row.user_liability, row.currency)} owed
                  </span>
                </div>
                {Number(row.shortfall) > 0 ? (
                  <p className="text-xs text-amber-600">
                    Shortfall {formatFullMoney(row.shortfall, row.currency)}
                  </p>
                ) : null}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 border-t border-border pt-3 sm:grid-cols-4">
          {treasury.system_wallets.map((wallet) => {
            const balance = wallet.balance as { NGN?: string; USDT?: string }
            return (
              <div key={wallet.type} className="space-y-0.5">
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                  {WALLET_LABEL[wallet.type] ?? wallet.type}
                </p>
                <p className="text-sm font-semibold tabular-nums text-foreground">
                  {formatCompactMoney(balance.NGN ?? '0', 'NGN')}
                </p>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatCompactMoney(balance.USDT ?? '0', 'USDT')}
                </p>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
