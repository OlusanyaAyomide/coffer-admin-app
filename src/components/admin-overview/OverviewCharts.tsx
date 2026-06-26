import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

type FlowChartPoint = {
  label: string;
  depositsNgn: number;
  depositsUsdt: number;
  withdrawalsNgn: number;
  withdrawalsUsdt: number;
};

type InterestChartPoint = {
  label: string;
  accruedNgn: number;
  accruedUsdt: number;
  paidNgn: number;
  paidUsdt: number;
};

type OverviewChartsProps = {
  flowChartData: Array<FlowChartPoint>;
  interestChartData: Array<InterestChartPoint>;
};

export function OverviewCharts({
  flowChartData,
  interestChartData,
}: OverviewChartsProps) {
  return (
    <div className="space-y-4">
      <Card className="rounded-lg">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Deposits vs withdrawals
          </CardTitle>
          <CardDescription className="text-xs">
            Period movement split by NGN and USDT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[340px] w-full"
            config={{
              depositsNgn: { label: 'NGN deposits', color: '#16a34a' },
              withdrawalsNgn: { label: 'NGN withdrawals', color: '#111827' },
              depositsUsdt: { label: 'USDT deposits', color: '#2563eb' },
              withdrawalsUsdt: { label: 'USDT withdrawals', color: '#f59e0b' },
            }}
          >
            <BarChart data={flowChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent payload={[]} label="" />} />
              <Bar
                dataKey="depositsNgn"
                fill="var(--color-depositsNgn)"
                radius={3}
              />
              <Bar
                dataKey="withdrawalsNgn"
                fill="var(--color-withdrawalsNgn)"
                radius={3}
              />
              <Bar
                dataKey="depositsUsdt"
                fill="var(--color-depositsUsdt)"
                radius={3}
              />
              <Bar
                dataKey="withdrawalsUsdt"
                fill="var(--color-withdrawalsUsdt)"
                radius={3}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="rounded-lg">
        <CardHeader className="border-b border-border pb-3">
          <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
            Interest movement
          </CardTitle>
          <CardDescription className="text-xs">
            Accrued interest against paid-out interest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            className="h-[340px] w-full"
            config={{
              accruedNgn: { label: 'NGN accrued', color: '#f59e0b' },
              paidNgn: { label: 'NGN paid', color: '#111827' },
              accruedUsdt: { label: 'USDT accrued', color: '#7c3aed' },
              paidUsdt: { label: 'USDT paid', color: '#2563eb' },
            }}
          >
            <AreaChart data={interestChartData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent payload={[]} label="" />} />
              <Area
                type="monotone"
                dataKey="accruedNgn"
                stroke="var(--color-accruedNgn)"
                fill="var(--color-accruedNgn)"
                fillOpacity={0.18}
              />
              <Area
                type="monotone"
                dataKey="paidNgn"
                stroke="var(--color-paidNgn)"
                fill="var(--color-paidNgn)"
                fillOpacity={0.12}
              />
              <Area
                type="monotone"
                dataKey="accruedUsdt"
                stroke="var(--color-accruedUsdt)"
                fill="var(--color-accruedUsdt)"
                fillOpacity={0.14}
              />
              <Area
                type="monotone"
                dataKey="paidUsdt"
                stroke="var(--color-paidUsdt)"
                fill="var(--color-paidUsdt)"
                fillOpacity={0.12}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
