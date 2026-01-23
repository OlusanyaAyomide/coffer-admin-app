import { Cell, Pie, PieChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getCurrencyDistribution, formatCurrency } from '@/services/WalletLedgerService';
import type { WalletLedgerData, CurrencyType } from '@/types/UserTypes';

interface CurrencyDistributionChartProps {
  data: WalletLedgerData;
  currency: CurrencyType;
}

export default function CurrencyDistributionChart({ data, currency }: CurrencyDistributionChartProps) {
  const { ngn, usd } = getCurrencyDistribution({ data, currency });

  const currencyData = [
    { currency: "ngn", value: ngn, fill: "#3b82f6" }, // Blue-500
    { currency: "usd", value: usd, fill: "#22c55e" }, // Green-500
  ];

  const currencyConfig = {
    value: { label: "Value" },
    ngn: { label: "NGN", color: "#3b82f6" },
    usd: { label: "USD", color: "#22c55e" },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Currency Distribution</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="flex items-center justify-center gap-8">
          <ChartContainer
            config={currencyConfig}
            className="h-[200px] w-[200px]"
          >
            <PieChart width={200} height={200}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel payload={[]} label="" />}
              />
              <Pie
                data={currencyData}
                dataKey="value"
                nameKey="currency"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={3}
                cx="50%"
                cy="50%"
              >
                <Cell key="cell-0" fill="#3b82f6" />
                <Cell key="cell-1" fill="#22c55e" />
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Manual Legend */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#3b82f6]"></div>
              <span className="text-sm text-foreground">NGN</span>
              <span className="text-sm text-muted-foreground ml-1">
                {formatCurrency({ amount: ngn, currency: 'NGN' })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#22c55e]"></div>
              <span className="text-sm text-foreground">USD</span>
              <span className="text-sm text-muted-foreground ml-1">
                {formatCurrency({ amount: usd, currency: 'USD' })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
