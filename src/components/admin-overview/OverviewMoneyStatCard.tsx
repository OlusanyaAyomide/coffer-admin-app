import type React from 'react';

import type { ConvertedCurrencyTotals } from '@/types/AdminOverviewTypes';
import { formatCabalMoney } from '@/lib/cabalFormat';
import { cn } from '@/lib/utils';

type OverviewMoneyStatCardProps = {
  title: string;
  totals: ConvertedCurrencyTotals;
  icon: React.ElementType;
  accentClassName: string;
  subValue?: React.ReactNode;
};

export function OverviewMoneyStatCard({
  title,
  totals,
  icon: Icon,
  accentClassName,
  subValue,
}: OverviewMoneyStatCardProps) {
  return (
    <div className="w-[255px] shrink-0 rounded-lg border border-border bg-card p-4 shadow-[0px_1px_2px_0px_rgba(13,19,50,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[165px] text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <span className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Icon className={cn('h-4 w-4 text-muted-foreground', accentClassName)} />
        </span>
      </div>

      <div className="mt-4 space-y-1 text-xl font-semibold leading-tight text-foreground">
        <div>{formatCabalMoney(totals.NGN, 'NGN')}</div>
        <div>{formatCabalMoney(totals.USDT, 'USDT')}</div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">
        {subValue ??
          `${formatCabalMoney(totals.converted_total.NGN, 'NGN')} converted total`}
      </p>
    </div>
  );
}
