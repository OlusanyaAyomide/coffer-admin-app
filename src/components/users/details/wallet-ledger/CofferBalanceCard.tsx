import type { CurrencyType, WalletLedgerData } from '@/types/UserTypes';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, getCofferBalance } from '@/services/WalletLedgerService';

interface CofferBalanceCardProps {
  data: WalletLedgerData;
  currency: CurrencyType;
  onCurrencyChange: (currency: CurrencyType) => void;
}

export default function CofferBalanceCard({ data, currency, onCurrencyChange }: CofferBalanceCardProps) {
  const { total, locked, available } = getCofferBalance({ data, currency });

  return (
    <Card className="bg-card border-border flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary"></div>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">COFFER BALANCE</span>
          </div>
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
      <CardContent className="flex-1 space-y-4 pt-2">
        <h2 className="text-3xl font-bold">{formatCurrency({ amount: total, currency })}</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Locked</span>
            <span className="font-medium">{formatCurrency({ amount: locked, currency })}</span>
          </div>
          <Separator />
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Available for Release</span>
            <span className="font-medium">{formatCurrency({ amount: available, currency })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
