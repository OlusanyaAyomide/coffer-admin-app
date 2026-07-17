import { Bar, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from 'recharts'
import {
  MONEY_MOVEMENT_CHART_CONFIG,
  formatCompactMoney,
} from './financialsOverviewFormat'
import type {
  MoneySeriesPoint,
  OverviewCurrency,
} from '@/types/FinancialsTypes'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

type MoneyMovementChartProps = {
  points: Array<MoneySeriesPoint>
  currency: OverviewCurrency
  granularity: string
}

/** The chart shows one currency at a time; NGN leads an "all" view for this NGN-heavy book. */
function chartCurrency(currency: OverviewCurrency): 'NGN' | 'USDT' {
  return currency === 'USDT' ? 'USDT' : 'NGN'
}

function formatBucketLabel(bucket: string, granularity: string): string {
  const date = new Date(bucket)
  if (granularity === 'hour') {
    return date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      timeZone: 'Africa/Lagos',
    })
  }
  if (granularity === 'month') {
    return date.toLocaleDateString(undefined, {
      month: 'short',
      year: '2-digit',
    })
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function MoneyMovementChart({
  points,
  currency,
  granularity,
}: MoneyMovementChartProps) {
  const cur = chartCurrency(currency)

  const data = points.map((point) => {
    const deposits = Number(point.deposits[cur] ?? 0)
    const withdrawals = Number(point.withdrawals[cur] ?? 0)
    return {
      label: formatBucketLabel(point.bucket, granularity),
      deposits,
      withdrawals,
      net: deposits - withdrawals,
    }
  })

  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Money movement
          </CardTitle>
          <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {cur}
          </span>
        </div>
        <CardDescription className="text-xs">
          Deposits against withdrawals, with net flow. Bucketed by {granularity}
          , Lagos time.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer
          className="h-[320px] w-full"
          config={MONEY_MOVEMENT_CHART_CONFIG}
        >
          <ComposedChart data={data}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="text-xs"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={56}
              tickFormatter={(value: number) => formatCompactMoney(value, cur)}
              className="text-xs"
            />
            <ChartTooltip
              content={<ChartTooltipContent payload={[]} label="" />}
            />
            <Bar
              dataKey="deposits"
              fill="var(--color-deposits)"
              radius={[3, 3, 0, 0]}
            />
            <Bar
              dataKey="withdrawals"
              fill="var(--color-withdrawals)"
              radius={[3, 3, 0, 0]}
            />
            <Line
              type="monotone"
              dataKey="net"
              stroke="var(--color-net)"
              strokeWidth={2}
              dot={false}
            />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
