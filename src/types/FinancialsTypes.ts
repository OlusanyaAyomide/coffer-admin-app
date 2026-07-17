import type { PaginationType } from '@/types/ResponseTypes'

/**
 * Mirrors the backend `/admin/financials/*` contract. Types are duplicated by hand here —
 * there is no codegen between the two apps.
 */

/**
 * Business flow, derived server-side rather than read off `Transaction.category`.
 *
 * Crypto withdrawals are written with `category: 'transfer'`, and `category: 'transfer'`
 * conflates internal P2P, external payout and crypto withdrawal. The backend's FLOW_SQL
 * repairs this at read time. `unknown` is a real bucket — legacy rows exist that match no
 * current writer — and is shown, not hidden.
 */
export type Flow =
  | 'deposit'
  | 'withdrawal'
  | 'swap'
  | 'internal_transfer'
  | 'external_transfer'
  | 'locker'
  | 'cabal'
  | 'investment'
  | 'fee'
  | 'unknown'

/**
 * The processing rail, derived from the `external_reference` format.
 * `internal` = no provider involved. `unknown` = shape matches no known writer.
 */
export type Provider =
  | 'busha'
  | 'palmpay'
  | 'yellow_card'
  | 'lenco'
  | 'paystack'
  | 'internal'
  | 'unknown'

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed'

export type LedgerUser = {
  id: string
  first_name: string | null
  last_name: string | null
  email: string
  coffer_id: string
}

export type LedgerDestination = {
  type: 'internal_wallet' | 'bank' | 'crypto' | 'momo'
  /** The destination BANK, not the rail. The rail is the row's `provider`. */
  bank: string | null
  network: string | null
  identifier: string | null
  holder_name: string | null
}

export type LedgerTransaction = {
  id: string
  reference: string
  external_reference: string | null
  status: TransactionStatus
  category: string
  flow: Flow
  provider: Provider
  base_currency: string | null
  quote_currency: string | null
  /** Decimal string — never parse into a float for display arithmetic. */
  amount: string | null
  rate: string | null
  charges_total: string
  entry_count: number
  description: string | null
  failure_reason: string | null
  user: LedgerUser | null
  destination: LedgerDestination | null
  /** Seconds between created_at and updated_at. A proxy: `updated_at` is @updatedAt. */
  settlement_latency_proxy: number | null
  created_at: string
  updated_at: string
}

export type LedgerStatusSummary = {
  total: number
  completed: number
  pending: number
  failed: number
  reversed: number
}

export type LedgerSummary = {
  by_currency: Array<{
    currency: string
    count: number
    volume: string
  }>
  by_status: LedgerStatusSummary
  /** `Transaction.amount` is Decimal(18,2), so USDT volume is truncated to cents. */
  amount_precision: string
}

export type LedgerResponse = {
  success: boolean
  data: {
    transactions: Array<LedgerTransaction>
    summary: LedgerSummary
  }
  meta: PaginationType
}

export type LedgerEntry = {
  id: string
  amount: string
  currency: string
  direction: 'debit' | 'credit'
  created_at: string
  account: {
    kind: string
    id: string | null
    label: string
    wallet_type?: string
  }
}

export type LedgerCharge = {
  id: string
  type: 'processor_fee' | 'vat_charge'
  amount: string
  currency: string
  created_at: string
}

export type BalancePerCurrency = {
  currency: string
  debit: string
  credit: string
  delta: string
  balanced: boolean
}

export type TransactionIntegrity = {
  has_entries: boolean
  /** Null for swaps — they debit one currency and credit another by design. */
  balanced_per_currency: Array<BalancePerCurrency> | null
  balance_check_skipped_reason: string | null
  duplicate_external_reference: boolean
  duplicate_count: number
  is_stuck: boolean
}

export type TransactionDetail = LedgerTransaction & {
  entries: Array<LedgerEntry>
  charges: Array<LedgerCharge>
  meta_data: Record<string, unknown> | null
  product_id: string | null
  DestinationPaymentAccount: LedgerDestination | null
}

export type TransactionDetailResponse = {
  success: boolean
  data: {
    transaction: TransactionDetail
    integrity: TransactionIntegrity
  }
}

/* ------------------------------------------------------------------ */
/* Financials overview                                                */
/* ------------------------------------------------------------------ */

export type OverviewRange = '24h' | '7d' | '30d' | 'all'
export type OverviewCurrency = 'all' | 'NGN' | 'USDT'

/** Per-currency money, as decimal strings. */
export type MoneyByCurrency = {
  NGN: string
  USDT: string
}

export type OverviewKpis = {
  total_volume: MoneyByCurrency
  net_revenue: MoneyByCurrency & { take_rate_bps: number }
  treasury_balance: MoneyByCurrency & { coverage_ratio: number | null }
  throughput: {
    success_rate: number | null
    completed: number
    pending: number
    failed: number
    stuck: number | null
  }
}

export type MoneySeriesPoint = {
  bucket: string
  deposits: Record<string, string>
  withdrawals: Record<string, string>
  count: number
}

export type FlowBreakdownRow = {
  flow: Flow
  currency: string
  count: number
  volume: string
  avg: string
}

export type StatusFunnelRow = {
  flow: Flow
  pending: number
  completed: number
  failed: number
  reversed: number
  total: number
  success_rate: number | null
  drop_off_rate: number | null
}

export type RevenueByFlow = {
  flow: Flow
  currency: string
  fees_earned: string
}

export type TakeRateRow = {
  flow: Flow
  currency: string
  gross_volume: string
  fees_earned: string
  bps: number
}

export type RevenueGap = {
  flow: Flow
  currency: string
  gross_volume: string
  reason: string
  foregone_estimate: string
  detail: string
}

export type RevenueReconciliation = {
  currency: string
  system_fee_wallet_balance: string
  system_fee_entry_sum: string
  delta: string
}

export type SystemWallet = {
  type: 'treasury' | 'system_fee' | 'processor_fee' | 'vat_charges'
  count: number
  balance: {
    NGN?: string
    USDT?: string
    converted_total?: { NGN: string; USDT: string; rate: string }
  }
}

export type TreasuryCoverage = {
  currency: string
  treasury_balance: string
  user_liability: string
  ratio: number | null
  shortfall: string
}

export type OrphanedWallet = {
  id: string
  kind: string
  type: string
  balance: string
}

export type OverviewResponse = {
  success: boolean
  data: {
    period: {
      from: string
      to: string
      range: OverviewRange
      currency: OverviewCurrency
      granularity: string
      timezone: string
    }
    kpis: OverviewKpis
    money_series: { granularity: string; points: Array<MoneySeriesPoint> }
    flow_breakdown: Array<FlowBreakdownRow>
    status_funnel: Array<StatusFunnelRow>
    revenue: {
      by_flow: Array<RevenueByFlow>
      take_rate_bps: Array<TakeRateRow>
      gaps: { illustrative_spread_bps: number; items: Array<RevenueGap> }
      integrity: Array<RevenueReconciliation>
    }
    treasury: {
      system_wallets: Array<SystemWallet>
      user_liability: { NGN: string; USDT: string }
      pending_exposure: { NGN: string; USDT: string }
      coverage: Array<TreasuryCoverage>
      missing_wallets: Array<{ id: string; kind: string }>
      orphaned_wallets: Array<OrphanedWallet>
    }
    data_quality: {
      null_amount_count: number
      null_currency_count: number
      zero_entry_completed_count: number
    }
    rail_health: unknown | null
    integrity: unknown | null
  }
}
