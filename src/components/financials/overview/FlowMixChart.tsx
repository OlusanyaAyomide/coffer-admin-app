import { useMemo } from 'react'
import { Cell, Label, Pie, PieChart } from 'recharts'
import { FLOW_LABEL, FLOW_MIX_CHART_CONFIG } from './financialsOverviewFormat'
import type { FlowBreakdownRow } from '@/types/FinancialsTypes'
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

type FlowMixChartProps = {
  breakdown: Array<FlowBreakdownRow>
}

/**
 * Share of activity by flow, by transaction count. Count rather than volume on purpose: volume
 * would mix NGN and USDT into one meaningless total, and internal flows carry no currency tag.
 */
export default function FlowMixChart({ breakdown }: FlowMixChartProps) {
  const data = useMemo(() => {
    const byFlow = new Map<string, number>()
    for (const row of breakdown) {
      byFlow.set(row.flow, (byFlow.get(row.flow) ?? 0) + row.count)
    }
    return [...byFlow.entries()]
      .map(([flow, count]) => ({
        flow,
        label: FLOW_LABEL[flow as keyof typeof FLOW_LABEL] ?? flow,
        count,
        fill: `var(--color-${flow})`,
      }))
      .sort((a, b) => b.count - a.count)
  }, [breakdown])

  const total = useMemo(
    () => data.reduce((sum, row) => sum + row.count, 0),
    [data],
  )

  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Activity by flow
        </CardTitle>
        <CardDescription className="text-xs">
          Share of transactions across money-movement types.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <ChartContainer
          className="mx-auto h-[220px] w-full"
          config={FLOW_MIX_CHART_CONFIG}
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent payload={[]} label="" nameKey="label" />
              }
            />
            <Pie
              data={data}
              dataKey="count"
              nameKey="label"
              innerRadius={62}
              outerRadius={92}
              strokeWidth={2}
            >
              {data.map((entry) => (
                <Cell key={entry.flow} fill={entry.fill} />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (!viewBox || !('cx' in viewBox)) return null
                  return (
                    <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                      <tspan
                        x={viewBox.cx}
                        y={viewBox.cy}
                        className="fill-foreground text-2xl font-semibold"
                      >
                        {total.toLocaleString()}
                      </tspan>
                      <tspan
                        x={viewBox.cx}
                        y={(viewBox.cy ?? 0) + 20}
                        className="fill-muted-foreground text-xs"
                      >
                        transactions
                      </tspan>
                    </text>
                  )
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>

        <ul className="mt-4 space-y-1.5">
          {data.slice(0, 5).map((row) => (
            <li
              key={row.flow}
              className="flex items-center justify-between text-xs"
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2 shrink-0 rounded-[2px]"
                  style={{ backgroundColor: row.fill }}
                />
                <span className="text-muted-foreground">{row.label}</span>
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {row.count.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
