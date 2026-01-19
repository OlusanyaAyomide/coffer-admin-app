"use client";

import { Cell, Pie, PieChart } from "recharts";
import type {
  ChartConfig} from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export default function WalletLedgerTab() {
  // Chart 1: Currency Distribution
  const currencyData = [
    { currency: "ngn", value: 4500, fill: "#3b82f6" }, // Blue-500
    { currency: "usd", value: 7950, fill: "#22c55e" }, // Green-500
  ];

  const currencyConfig = {
    value: { label: "Value" },
    ngn: { label: "NGN", color: "#3b82f6" },
    usd: { label: "USD", color: "#22c55e" },
  } satisfies ChartConfig;

  // Chart 2: Asset Allocation
  const allocationData = [
    { asset: "wallet", value: 8250, fill: "#3b82f6" }, // Blue
    { asset: "locker", value: 3000, fill: "#f97316" }, // Orange
    { asset: "coffer", value: 1200, fill: "#a855f7" }, // Purple
  ];

  const allocationConfig = {
    value: { label: "Value" },
    wallet: { label: "Wallet", color: "#3b82f6" },
    locker: { label: "Locker", color: "#f97316" },
    coffer: { label: "Coffer", color: "#a855f7" },
  } satisfies ChartConfig;

  return (
    <div className="space-y-6">
      {/* Top Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Portfolio Balance Card */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total Portfolio Balance</span>
              <Button variant="link" className="text-primary p-0 h-auto font-normal text-xs">View Details</Button>
            </div>
            <div className="mt-3">
              <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">SELECT CURRENCY</label>
              <Select defaultValue="usd">
                <SelectTrigger className="w-full h-8 bg-secondary/50 border-border text-xs">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="usd">USD - US Dollar</SelectItem>
                  <SelectItem value="ngn">NGN - Nigerian Naira</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="mt-auto pt-2">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold">$12,450.00</h2>
              <div className="flex items-center gap-2 text-xs">
                <span className="text-green-500 font-medium">Active</span>
                <span className="text-muted-foreground">• Est. Value</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coffer Balance Card */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">COFFER BALANCE</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 pt-2">
            <h2 className="text-3xl font-bold">$1,200.00</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Locked</span>
                <span className="font-medium">$1,000.00</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available for Release</span>
                <span className="font-medium">$200.00</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Locker Balance Card */}
        <Card className="bg-card border-border flex flex-col">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">LOCKER BALANCE</span>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4 pt-2">
            <h2 className="text-3xl font-bold">$3,000.00</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Locked / Staked</span>
                <span className="font-medium">$3,000.00</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Available</span>
                <span className="font-medium">$0.00</span>
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
                  <span className="text-sm text-muted-foreground ml-1">₦4,500</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-[#22c55e]"></div>
                  <span className="text-sm text-foreground">USD</span>
                  <span className="text-sm text-muted-foreground ml-1">$7,950</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset Allocation Chart */}
        <Card className="flex flex-col">
          <CardHeader className="items-center pb-0">
            <CardTitle>Asset Allocation</CardTitle>
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
                    <Cell key="cell-1" fill="#f97316" />
                    <Cell key="cell-2" fill="#a855f7" />
                  </Pie>
                </PieChart>
              </ChartContainer>
              {/* Manual Legend */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-[#3b82f6]"></div>
                  <span className="text-sm text-foreground">Wallet</span>
                  <span className="text-sm text-muted-foreground ml-1">$8,250</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-[#f97316]"></div>
                  <span className="text-sm text-foreground">Locker</span>
                  <span className="text-sm text-muted-foreground ml-1">$3,000</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-sm bg-[#a855f7]"></div>
                  <span className="text-sm text-foreground">Coffer</span>
                  <span className="text-sm text-muted-foreground ml-1">$1,200</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
