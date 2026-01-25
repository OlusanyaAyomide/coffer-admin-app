import { Cell, Pie, PieChart } from "recharts";
import type { ChartConfig } from "@/components/ui/chart";
import type { CurrencyType, WalletLedgerData } from '@/types/UserTypes';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { formatCurrency, getAssetAllocation } from '@/services/WalletLedgerService';

interface AssetAllocationChartProps {
  data: WalletLedgerData;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
}

export default function AssetAllocationChart({ data, currency, onCurrencyChange }: AssetAllocationChartProps) {
  const { wallet, coffer, locker } = getAssetAllocation({ data, currency });

  const allocationData = [
    { asset: "wallet", value: wallet, fill: "#3b82f6" }, // Blue
    { asset: "coffer", value: coffer, fill: "#a855f7" }, // Purple
    // TODO: Update when locker feature is implemented
    { asset: "locker", value: locker, fill: "#f97316" }, // Orange
  ];

  const allocationConfig = {
    value: { label: "Value" },
    wallet: { label: "Wallet", color: "#3b82f6" },
    coffer: { label: "Coffer", color: "#a855f7" },
    locker: { label: "Locker", color: "#f97316" },
  } satisfies ChartConfig;

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <div className="flex items-center justify-between w-full">
          <CardTitle>Asset Allocation</CardTitle>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${currency === 'NGN' ? 'text-primary' : 'text-muted-foreground'}`}>NGN</span>
            <Switch
              size="sm"
              checked={currency === 'USD'}
              onCheckedChange={(checked) => onCurrencyChange(checked ? 'USD' : 'NGN')}
            />
            <span className={`text-xs font-medium ${currency === 'USD' ? 'text-primary' : 'text-muted-foreground'}`}>USD</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <div className="flex items-center justify-center gap-8">
          <ChartContainer
            config={allocationConfig}
            className="h-[200px] w-[200px]"
          >
            <PieChart width={200} height={200}>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel payload={[]} label="" />}
              />
              <Pie
                data={allocationData}
                dataKey="value"
                nameKey="asset"
                innerRadius={50}
                outerRadius={80}
                strokeWidth={3}
                cx="50%"
                cy="50%"
              >
                <Cell key="cell-0" fill="#3b82f6" />
                <Cell key="cell-1" fill="#a855f7" />
                <Cell key="cell-2" fill="#f97316" />
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Manual Legend */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#3b82f6]"></div>
              <span className="text-sm text-foreground">Wallet</span>
              <span className="text-sm text-muted-foreground ml-1">
                {formatCurrency({ amount: wallet, currency })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#a855f7]"></div>
              <span className="text-sm text-foreground">Coffer</span>
              <span className="text-sm text-muted-foreground ml-1">
                {formatCurrency({ amount: coffer, currency })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-sm bg-[#f97316]"></div>
              <span className="text-sm text-foreground">Locker</span>
              <span className="text-sm text-muted-foreground ml-1">
                {formatCurrency({ amount: locker, currency })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
