import type { CurrencyType, WalletLedgerData } from '@/types/UserTypes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, getTotalPortfolio } from '@/services/WalletLedgerService';

interface TotalPortfolioCardProps {
  data: WalletLedgerData;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
}

export default function TotalPortfolioCard({ data, currency, onCurrencyChange }: TotalPortfolioCardProps) {
  const totalAmount = getTotalPortfolio({ data, currency });

  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Total Portfolio Balance</span>
          <Button variant="link" className="text-primary p-0 h-auto font-normal text-xs">View Details</Button>
        </div>
        <div className="mt-3">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">SELECT CURRENCY</label>
          <Select value={currency.toLowerCase()} onValueChange={(val) => onCurrencyChange(val.toUpperCase() as CurrencyType)}>
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
          <h2 className="text-3xl font-bold">{formatCurrency({ amount: totalAmount, currency })}</h2>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-green-500 font-medium">Active</span>
            <span className="text-muted-foreground">• Est. Value</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
