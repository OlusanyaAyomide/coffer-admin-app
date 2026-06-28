import type {
  AdminInvestmentStatus,
  DividendFrequency,
  DividendType,
  InvestmentCurrency,
  UserInvestmentStatus,
} from '@/types/InvestmentTypes';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

export function formatMoney(
  value: string | number | null | undefined,
  currency: InvestmentCurrency = 'NGN',
): string {
  const amount = typeof value === 'string' ? Number(value) : value ?? 0;
  if (Number.isNaN(amount)) return '—';
  const symbol = currency === 'USDT' ? '$' : '₦';
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export const INVESTMENT_STATUS_LABELS: Record<AdminInvestmentStatus, string> = {
  draft: 'Draft',
  awaiting_start: 'Awaiting start',
  active: 'Active',
  matured: 'Matured',
  cancelled: 'Cancelled',
};

export function investmentStatusBadgeVariant(
  status: AdminInvestmentStatus,
): BadgeVariant {
  switch (status) {
    case 'active':
      return 'default';
    case 'awaiting_start':
      return 'secondary';
    case 'matured':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    case 'draft':
    default:
      return 'outline';
  }
}

export const DIVIDEND_FREQUENCY_LABELS: Record<DividendFrequency, string> = {
  ending: 'At maturity only',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annually: 'Semi-annually',
  annually: 'Annually',
};

export const DIVIDEND_TYPE_LABELS: Record<DividendType, string> = {
  interim_payout: 'Interim payout',
  final_payout: 'Final payout',
  capital_payout: 'Capital return',
};

export const USER_INVESTMENT_STATUS_LABELS: Record<
  UserInvestmentStatus,
  string
> = {
  active: 'Active',
  matured: 'Matured',
  withdrawn: 'Withdrawn',
  cancelled: 'Cancelled',
  not_started: 'Not started',
};
