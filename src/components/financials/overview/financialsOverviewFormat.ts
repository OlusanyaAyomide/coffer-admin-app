import type { ChartConfig } from '@/components/ui/chart'
import type { Flow } from '@/types/FinancialsTypes'

/** Currency symbol for a code. Only NGN and USDT exist in the system today. */
const SYMBOL: Record<string, string> = { NGN: '₦', USDT: '$' }

/**
 * Compact money for KPI headlines and axis ticks: ₦302.1K, $1.2M. Amounts arrive as decimal
 * strings and are parsed only here, at the render boundary.
 */
export function formatCompactMoney(
  amount: string | number,
  currency: string,
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(value)) return String(amount)

  const symbol = SYMBOL[currency] ?? ''
  const abs = Math.abs(value)

  if (abs >= 1_000_000) return `${symbol}${(value / 1_000_000).toFixed(1)}M`
  if (abs >= 1_000) return `${symbol}${(value / 1_000).toFixed(1)}K`
  return `${symbol}${value.toLocaleString(undefined, { maximumFractionDigits: currency === 'USDT' ? 2 : 0 })}`
}

/** Full-precision money for tooltips and detail rows. */
export function formatFullMoney(
  amount: string | number,
  currency: string,
): string {
  const value = typeof amount === 'string' ? Number(amount) : amount
  if (Number.isNaN(value)) return String(amount)
  const symbol = SYMBOL[currency] ?? ''
  return `${symbol}${value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: currency === 'USDT' ? 4 : 2,
  })}`
}

export function formatPercent(ratio: number | null, digits = 1): string {
  if (ratio === null || Number.isNaN(ratio)) return 'N/A'
  return `${(ratio * 100).toFixed(digits)}%`
}

export const FLOW_LABEL: Record<Flow, string> = {
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

/**
 * Money-movement chart config. Colors are semantic tokens (inflow/outflow/net), never hex —
 * `ChartContainer` turns each into `var(--color-<key>)`.
 */
export const MONEY_MOVEMENT_CHART_CONFIG: ChartConfig = {
  deposits: { label: 'Deposits', color: 'var(--chart-inflow)' },
  withdrawals: { label: 'Withdrawals', color: 'var(--chart-outflow)' },
  net: { label: 'Net flow', color: 'var(--chart-net)' },
}

/** Flow-mix donut config — the categorical indigo ramp, one slice per flow. */
export const FLOW_MIX_CHART_CONFIG: ChartConfig = {
  deposit: { label: 'Deposit', color: 'var(--chart-inflow)' },
  withdrawal: { label: 'Withdrawal', color: 'var(--chart-outflow)' },
  swap: { label: 'Swap', color: 'var(--chart-3)' },
  external_transfer: { label: 'External Transfer', color: 'var(--chart-2)' },
  internal_transfer: { label: 'Internal Transfer', color: 'var(--chart-1)' },
  locker: { label: 'Locker', color: 'var(--chart-4)' },
  cabal: { label: 'Cabal', color: 'var(--chart-5)' },
  investment: { label: 'Investment', color: 'var(--chart-fee)' },
  fee: { label: 'Fee', color: 'var(--muted-foreground)' },
  unknown: { label: 'Unclassified', color: 'var(--muted-foreground)' },
}
