import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type {
  ConvertedCurrencyTotals,
  ProductOverviewTotals,
} from '@/types/AdminOverviewTypes';
import { formatCabalMoney } from '@/lib/cabalFormat';
import { cn } from '@/lib/utils';

type OverviewProductCardProps = {
  title: string;
  product: ProductOverviewTotals;
  accentClassName: string;
};

export function OverviewProductCard({
  title,
  product,
  accentClassName,
}: OverviewProductCardProps) {
  return (
    <Card className="w-full rounded-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <span className={cn('h-2 w-2 rounded-full', accentClassName)} />
          <CardTitle className="text-base font-medium">{title}</CardTitle>
        </div>
        <CardDescription>
          {product.count.toLocaleString()} active record(s)
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 text-sm">
        <ProductMoneyRow label="Balance" totals={product.balance} />
        <ProductMoneyRow label="Capital" totals={product.capital} />
        <ProductMoneyRow label="Interest" totals={product.interest} />
      </CardContent>
    </Card>
  );
}

function ProductMoneyRow({
  label,
  totals,
}: {
  label: string;
  totals: ConvertedCurrencyTotals;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-border/70 pb-2 last:border-b-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right text-sm font-medium text-foreground">
        <span className="block">{formatCabalMoney(totals.NGN, 'NGN')}</span>
        <span className="block">{formatCabalMoney(totals.USDT, 'USDT')}</span>
      </span>
    </div>
  );
}
