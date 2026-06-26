import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Banknote,
  CircleDollarSign,
  Percent,
  Users,
  Wallet,
} from 'lucide-react';
import type React from 'react';

import type { AdminOverviewData } from '@/types/AdminOverviewTypes';
import { OverviewMoneyStatCard } from './OverviewMoneyStatCard';

type OverviewSummaryCardsProps = {
  overview: AdminOverviewData;
};

export function OverviewSummaryCards({ overview }: OverviewSummaryCardsProps) {
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2">
      <div className="flex min-w-max gap-3">
        <OverviewMoneyStatCard
          title="Total Locker Balance"
          totals={overview.summary.locker_balance}
          icon={Wallet}
          accentClassName="text-brand"
        />
        <OverviewMoneyStatCard
          title="Capital Held"
          totals={overview.summary.capital_held}
          icon={Banknote}
          accentClassName="text-emerald-600"
        />
        <OverviewMoneyStatCard
          title="Accrued Interest"
          totals={overview.summary.accrued_interest}
          icon={Percent}
          accentClassName="text-amber-600"
        />
        <OverviewMoneyStatCard
          title="Interest Paid 24h"
          totals={overview.summary.interest_paid_out_24h}
          icon={CircleDollarSign}
          accentClassName="text-indigo-600"
          subValue={
            overview.data_quality.unclassified_paid_interest_events > 0
              ? `${overview.data_quality.unclassified_paid_interest_events} older payout(s) lacked breakdown`
              : 'Exact payout interest where tagged'
          }
        />
        <OverviewMoneyStatCard
          title="Deposits"
          totals={overview.summary.deposits}
          icon={ArrowDownToLine}
          accentClassName="text-emerald-600"
        />
        <OverviewMoneyStatCard
          title="Withdrawals"
          totals={overview.summary.withdrawals}
          icon={ArrowUpFromLine}
          accentClassName="text-slate-700"
        />
        <OverviewCountCard
          title="Failed Debits"
          value={overview.summary.failed_debits.toLocaleString()}
          subValue="Goal-Lock and Cabal failed debit count"
          icon={AlertTriangle}
          iconClassName="text-amber-600"
        />
        <OverviewCountCard
          title="Active Locker Users"
          value={overview.summary.active_locker_users.toLocaleString()}
          subValue="Users with active held value"
          icon={Users}
          iconClassName="text-blue-600"
        />
      </div>
    </div>
  );
}

function OverviewCountCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconClassName,
}: {
  title: string;
  value: string;
  subValue: string;
  icon: React.ElementType;
  iconClassName: string;
}) {
  return (
    <div className="w-[255px] shrink-0 rounded-lg border border-border bg-card p-4 shadow-[0px_1px_2px_0px_rgba(13,19,50,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <p className="max-w-[165px] text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </p>
        <span className="flex size-8 items-center justify-center rounded-md bg-muted">
          <Icon className={`h-4 w-4 ${iconClassName}`} />
        </span>
      </div>
      <p className="mt-4 text-2xl font-semibold leading-tight text-foreground">
        {value}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">{subValue}</p>
    </div>
  );
}
