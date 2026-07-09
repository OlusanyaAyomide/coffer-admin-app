import type {
  AdminInvestmentStatus,
  DividendFrequency,
  DividendType,
  InvestmentCurrency,
  ReturnPayoutStrategy,
  UserInvestmentStatus,
} from '@/types/InvestmentTypes'

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline'

export function formatMoney(
  value: string | number | null | undefined,
  currency: InvestmentCurrency = 'NGN',
): string {
  const amount = typeof value === 'string' ? Number(value) : (value ?? 0)
  if (Number.isNaN(amount)) return '—'
  const symbol = currency === 'USDT' ? '$' : '₦'
  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export const INVESTMENT_STATUS_LABELS: Record<AdminInvestmentStatus, string> = {
  draft: 'Draft',
  awaiting_start: 'Awaiting start',
  active: 'Active',
  matured: 'Matured',
  cancelled: 'Cancelled',
}

export function investmentStatusBadgeVariant(
  status: AdminInvestmentStatus,
): BadgeVariant {
  switch (status) {
    case 'active':
      return 'default'
    case 'awaiting_start':
      return 'secondary'
    case 'matured':
      return 'outline'
    case 'cancelled':
      return 'destructive'
    case 'draft':
    default:
      return 'outline'
  }
}

export const DIVIDEND_FREQUENCY_LABELS: Record<DividendFrequency, string> = {
  ending: 'At maturity only',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annually: 'Semi-annually',
  annually: 'Annually',
}

export const DIVIDEND_TYPE_LABELS: Record<DividendType, string> = {
  interim_payout: 'Interim payout',
  final_payout: 'Final payout',
  capital_payout: 'Capital return',
}

/**
 * Label a dividend schedule row's share. Interest/dividend payouts are expressed as a
 * percentage of the total return (`percentage_of_return`), not of capital — a payout is a
 * slice of the interest, never the principal. The `capital_payout` row returns the principal,
 * so it is labeled as such rather than "0% of interest".
 */
export function dividendShareLabel(
  type: DividendType,
  percentageOfReturn: number,
): string {
  if (type === 'capital_payout') return 'Principal returned'
  const rounded = Number.isFinite(percentageOfReturn)
    ? Number(percentageOfReturn.toFixed(2))
    : 0
  return `${rounded}% of interest`
}

export const RETURN_PAYOUT_STRATEGY_LABELS: Record<
  ReturnPayoutStrategy,
  string
> = {
  at_maturity: 'At maturity',
  upfront: 'One-time upfront',
  recurring: 'Recurring',
  upfront_and_recurring: 'Upfront + recurring',
}

export const USER_INVESTMENT_STATUS_LABELS: Record<
  UserInvestmentStatus,
  string
> = {
  active: 'Active',
  matured: 'Matured',
  withdrawn: 'Withdrawn',
  cancelled: 'Cancelled',
  not_started: 'Not started',
}
