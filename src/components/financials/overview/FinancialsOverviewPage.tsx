import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import OverviewRangeControl from './OverviewRangeControl'
import type { RangeSelection } from './OverviewRangeControl'
import OverviewKpiCards from './OverviewKpiCards'
import IntegrityAlertBanner from './IntegrityAlertBanner'
import MoneyMovementChart from './MoneyMovementChart'
import FlowMixChart from './FlowMixChart'
import StatusFunnelCard from './StatusFunnelCard'
import RevenueSummaryCard from './RevenueSummaryCard'
import TreasuryCoverageCard from './TreasuryCoverageCard'
import OverviewSkeleton from './OverviewSkeleton'
import type { OverviewCurrency, OverviewRange } from '@/types/FinancialsTypes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatDate } from '@/services/TimeServices'
import useFinancialsOverview from '@/hooks/useFinancialsOverview'

export default function FinancialsOverviewPage() {
  const [range, setRange] = useState<OverviewRange | 'custom'>('30d')
  const [customFrom, setCustomFrom] = useState<string | undefined>()
  const [customTo, setCustomTo] = useState<string | undefined>()
  const [currency, setCurrency] = useState<OverviewCurrency>('all')

  const handleRangeChange = (selection: RangeSelection) => {
    setRange(selection.range)
    if (selection.range === 'custom') {
      setCustomFrom(selection.from)
      setCustomTo(selection.to)
    }
  }

  const customLabel =
    range === 'custom' && customFrom && customTo
      ? `${formatDate(customFrom)} → ${formatDate(customTo)}`
      : null

  const {
    overview,
    isOverviewLoading,
    isOverviewFetching,
    isOverviewError,
    refetchOverview,
  } = useFinancialsOverview({ range, currency, from: customFrom, to: customTo })

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Financial Overview
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Money movement, revenue and treasury standing across the platform.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <OverviewRangeControl
            range={range}
            customLabel={customLabel}
            onChange={handleRangeChange}
          />

          <Select
            value={currency}
            onValueChange={(value) => setCurrency(value as OverviewCurrency)}
          >
            <SelectTrigger className="h-10 w-[128px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All currency</SelectItem>
              <SelectItem value="NGN">NGN</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="icon"
            className="h-10 w-10"
            onClick={() => refetchOverview()}
            aria-label="Refresh"
          >
            <RefreshCw
              className={cn('h-4 w-4', isOverviewFetching && 'animate-spin')}
            />
          </Button>
        </div>
      </header>

      {isOverviewLoading || !overview ? (
        isOverviewError ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center">
            <p className="text-sm text-destructive">
              Could not load the financial overview.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => refetchOverview()}
            >
              Retry
            </Button>
          </div>
        ) : (
          <OverviewSkeleton />
        )
      ) : (
        <>
          <IntegrityAlertBanner data={overview} />

          <OverviewKpiCards kpis={overview.kpis} currency={currency} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <MoneyMovementChart
              points={overview.money_series.points}
              currency={currency}
              granularity={overview.money_series.granularity}
            />
            <FlowMixChart breakdown={overview.flow_breakdown} />
          </div>

          <StatusFunnelCard funnel={overview.status_funnel} />

          <div className="grid gap-4 lg:grid-cols-2">
            <RevenueSummaryCard revenue={overview.revenue} />
            <TreasuryCoverageCard treasury={overview.treasury} />
          </div>
        </>
      )}
    </div>
  )
}
