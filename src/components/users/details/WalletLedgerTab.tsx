"use client";

import { Pie, PieChart, Cell } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function WalletLedgerTab() {
  // Chart 1: Currency Distribution
  const currencyData = [
    { currency: "NGN", value: 4500, fill: "var(--color-ngn)" },
    { currency: "USD", value: 7950, fill: "var(--color-usd)" },
  ];

  const currencyConfig = {
    value: { label: "Value" },
    ngn: { label: "NGN", color: "hsl(var(--chart-1))" },
    usd: { label: "USD", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  // Chart 2: Asset Allocation
  const allocationData = [
    { asset: "Wallet", value: 8250, fill: "var(--color-wallet)" },
    { asset: "Locker", value: 3000, fill: "var(--color-locker)" },
    { asset: "Coffer", value: 1200, fill: "var(--color-coffer)" },
  ];

  const allocationConfig = {
    value: { label: "Value" },
    wallet: { label: "Wallet", color: "hsl(var(--chart-1))" },
    locker: { label: "Locker", color: "hsl(var(--chart-2))" },
    coffer: { label: "Coffer", color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total Balance</span>
              <Button variant="link" className="text-blue-500 p-0 h-auto font-normal text-xs">View Details</Button>
            </div>
            <div className="mt-4">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">SELECT CURRENCY</label>
              <Select defaultValue="usd">
                <SelectTrigger className="w-full bg-secondary/50 border-border">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="mt-auto">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-medium">TOTAL BALANCE (USD EQUIV)</span>
              <h2 className="text-3xl font-bold">$12,450.00</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-500 font-medium">Active</span>
                <span className="text-muted-foreground">• Last updated: Just now</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Balance Card */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">AVAILABLE BALANCE</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-between pt-0 mt-2">
            <h2 className="text-4xl font-bold">$8,250.00</h2>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">Add Funds</Button>
              <Button variant="outline" className="w-full bg-secondary/30 hover:bg-secondary/50 border-border">Withdraw</Button>
            </div>
          </CardContent>
        </Card>

        {/* Locked / Staked Card */}
        <Card className="bg-card border-border flex flex-col">
          <CardContent className="p-6 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-orange-500"></div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LOCKED / STAKED</span>
              </div>
              <h2 className="text-3xl font-bold">$3,000.00</h2>
              <p className="text-xs text-muted-foreground mt-1">
                Funds currently in <span className="text-orange-500 font-medium">Locker (MMF)</span> or held for active orders.
              </p>
            </div>

            <Separator className="bg-border/50" />

            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">PENDING CLEARANCE</span>
              </div>
              <h2 className="text-3xl font-bold">$1,200.00</h2>
              <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                <span>Incoming Deposits</span>
                <span>$1,200.00</span>
              </div>
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>Pending Withdrawals</span>
                <span>$0.00</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Currency Distribution Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Currency Distribution</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={currencyConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel payload={[]} label="" />}
                />
                <Pie
                  data={currencyData}
                  dataKey="value"
                  nameKey="currency"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Cell key="cell-0" fill="var(--color-chart-1)" />
                  <Cell key="cell-1" fill="var(--color-chart-2)" />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="currency" />} className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Asset Allocation Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Asset Allocation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            <ChartContainer
              config={allocationConfig}
              className="mx-auto aspect-square max-h-[250px]"
            >
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel payload={[]} label="" />}
                />
                <Pie
                  data={allocationData}
                  dataKey="value"
                  nameKey="asset"
                  innerRadius={60}
                  strokeWidth={5}
                >
                  <Cell key="cell-0" fill="var(--color-chart-1)" />
                  <Cell key="cell-1" fill="var(--color-chart-3)" />
                  <Cell key="cell-2" fill="var(--color-chart-5)" />
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="asset" />} className="-translate-y-2 flex-wrap gap-2 *:basis-1/4 *:justify-center" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
