import { FLOW_LABEL, formatPercent } from './financialsOverviewFormat'
import type { StatusFunnelRow } from '@/types/FinancialsTypes'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { cn } from '@/lib/utils'

type StatusFunnelCardProps = {
  funnel: Array<StatusFunnelRow>
}

function Segment({
  value,
  total,
  className,
}: {
  value: number
  total: number
  className: string
}) {
  if (value === 0 || total === 0) return null
  return (
    <div
      className={cn('h-full', className)}
      style={{ width: `${(value / total) * 100}%` }}
    />
  )
}

export default function StatusFunnelCard({ funnel }: StatusFunnelCardProps) {
  const rows = [...funnel].sort((a, b) => b.total - a.total)

  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Settlement outcomes by flow
        </CardTitle>
        <CardDescription className="text-xs">
          Completed, failed and pending share per flow. Reversals are recorded
          as failures today (see Todo.md), so the reversed count stays at zero.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 pt-4">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-[var(--chart-inflow)]" />{' '}
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-destructive" /> Failed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2 rounded-[2px] bg-muted-foreground/40" />{' '}
            Pending
          </span>
        </div>

        <ul className="space-y-2.5">
          {rows.map((row) => {
            const lowSuccess =
              row.success_rate !== null && row.success_rate < 0.9
            return (
              <li key={row.flow} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">
                    {FLOW_LABEL[row.flow]}
                  </span>
                  <span className="flex items-center gap-3 tabular-nums text-muted-foreground">
                    <span>{row.total.toLocaleString()} txns</span>
                    <span
                      className={cn(
                        'font-medium',
                        lowSuccess ? 'text-amber-600' : 'text-foreground',
                      )}
                    >
                      {formatPercent(row.success_rate, 0)}
                    </span>
                  </span>
                </div>
                <div className="flex h-2 w-full overflow-hidden rounded-full bg-muted">
                  <Segment
                    value={row.completed}
                    total={row.total}
                    className="bg-[var(--chart-inflow)]"
                  />
                  <Segment
                    value={row.failed + row.reversed}
                    total={row.total}
                    className="bg-destructive"
                  />
                  <Segment
                    value={row.pending}
                    total={row.total}
                    className="bg-muted-foreground/40"
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </CardContent>
    </Card>
  )
}
