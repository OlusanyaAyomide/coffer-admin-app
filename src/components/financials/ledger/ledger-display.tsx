import type { Flow, Provider, TransactionStatus } from '@/types/FinancialsTypes'

/**
 * Display vocabulary for the ledger, shared by the table, mobile cards and detail sheet so
 * a flow never renders under two different names.
 */

export const FLOW_LABELS: Record<Flow, string> = {
  deposit: 'Deposit',
  withdrawal: 'Withdrawal',
  swap: 'Swap',
  internal_transfer: 'Internal Transfer',
  external_transfer: 'External Transfer',
  locker: 'Locker',
  cabal: 'Cabal',
  investment: 'Investment',
  fee: 'Fee',
  unknown: 'Unclassified',
}

export const PROVIDER_LABELS: Record<Provider, string> = {
  busha: 'Busha',
  palmpay: 'PalmPay',
  yellow_card: 'Yellow Card',
  lenco: 'Lenco',
  paystack: 'Paystack',
  internal: 'Internal',
  unknown: 'Unknown',
}

export const STATUS_LABELS: Record<TransactionStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  reversed: 'Reversed',
}

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'success'
  | 'outline'

export const STATUS_BADGE_VARIANT: Record<TransactionStatus, BadgeVariant> = {
  completed: 'success',
  pending: 'secondary',
  failed: 'destructive',
  reversed: 'outline',
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  NGN: '₦',
  USDT: '$',
}

/**
 * Formats a decimal string for display.
 *
 * Amounts arrive as decimal strings and are parsed only at the point of rendering — never
 * carried through the app as floats, and never used for arithmetic.
 */
export function formatAmount(
  amount: string | null,
  currency: string | null,
): string {
  if (amount === null) return 'N/A'

  const parsed = Number(amount)
  if (Number.isNaN(parsed)) return amount

  const symbol = currency ? (CURRENCY_SYMBOLS[currency] ?? '') : ''
  const fractionDigits = currency === 'USDT' ? 4 : 2

  return `${symbol}${parsed.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: fractionDigits,
  })}`
}

export function formatLatency(seconds: number | null): string {
  if (seconds === null) return 'N/A'
  if (seconds < 60) return `${seconds.toFixed(1)}s`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)}m`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)}h`
  return `${(seconds / 86400).toFixed(1)}d`
}
