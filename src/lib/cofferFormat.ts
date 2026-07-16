import type {
  AdminInvestmentStatus,
  AdminInvestmentVisibility,
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

/**
 * Mirrors `MAX_FEATURED_INVESTMENTS` in the backend's admin investment service,
 * which is the source of truth and rejects the overflow. Duplicated here only so
 * the UI can state the limit before the admin hits it — there is no shared
 * package between the two, the same way the status/visibility unions are
 * hand-mirrored from the Prisma enums.
 */
export const MAX_FEATURED_INVESTMENTS = 4

/**
 * Ceiling for percentage fields, mirroring `MAX_PERCENTAGE` in the backend DTO.
 * The underlying column is `Decimal(5, 2)`, so Postgres rejects anything that
 * rounds to 1000.00 or more. The API enforces it; this is here so the form can
 * stop the admin before they submit rather than bouncing a 400 back at them.
 */
export const MAX_PERCENTAGE = 999.99

export const INVESTMENT_STATUS_LABELS: Record<AdminInvestmentStatus, string> = {
  draft: 'Draft',
  awaiting_start: 'Awaiting start',
  active: 'Active',
  matured: 'Matured',
  cancelled: 'Cancelled',
}

/**
 * The status badge as it should read to a human, where inventory can outrank the
 * lifecycle. A plan whose units are gone is "Sold out" — that is the fact an
 * admin needs, and "Active" beside `5000 / 5000` reads as though there were
 * still something to sell.
 *
 * Only applies before maturity. A matured plan is done, so "Matured" is the more
 * meaningful label even though its units are also gone; draft and cancelled are
 * likewise lifecycle facts that inventory doesn't override.
 */
export function investmentDisplayStatus(investment: {
  status: AdminInvestmentStatus
  units_sold: number
  total_units: number
}): { label: string; variant: BadgeVariant } {
  const isSoldOut = investment.units_sold >= investment.total_units
  const inventoryMatters =
    investment.status === 'awaiting_start' || investment.status === 'active'

  if (isSoldOut && inventoryMatters) {
    // Neutral, not destructive: selling out is a milestone for an admin, not an
    // error. (The mobile app badges it red because there it means "you can't buy
    // this" — same fact, opposite news.)
    return { label: 'Sold out', variant: 'secondary' }
  }

  return {
    label: INVESTMENT_STATUS_LABELS[investment.status],
    variant: investmentStatusBadgeVariant(investment.status),
  }
}

export const INVESTMENT_VISIBILITY_LABELS: Record<
  AdminInvestmentVisibility,
  string
> = {
  visible: 'Visible',
  hidden: 'Hidden',
  archived: 'Archived',
}

export function investmentVisibilityBadgeVariant(
  visibility: AdminInvestmentVisibility,
): BadgeVariant {
  switch (visibility) {
    case 'hidden':
      return 'secondary'
    case 'archived':
      return 'destructive'
    case 'visible':
    default:
      return 'outline'
  }
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
