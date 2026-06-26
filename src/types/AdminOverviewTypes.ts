import type {
  ActiveRateEntry,
  CabalSummary,
  EntryCurrency,
  GroupSavingStatus,
} from '@/types/LockerTypes';
import type { PaginationType } from '@/types/ResponseTypes';

export type OverviewRange = '24h' | '7d' | '30d' | 'custom' | 'all';
export type OverviewCurrencyFilter = 'all' | EntryCurrency;

export type CurrencyTotals = {
  NGN: string;
  USDT: string;
};

export type ConvertedCurrencyTotals = CurrencyTotals & {
  converted_total: CurrencyTotals & {
    rate: string;
  };
};

export type ProductOverviewTotals = {
  count: number;
  capital: ConvertedCurrencyTotals;
  interest: ConvertedCurrencyTotals;
  balance: ConvertedCurrencyTotals;
};

export type OverviewChartPoint = {
  label: string;
  deposits?: CurrencyTotals;
  withdrawals?: CurrencyTotals;
  accrued?: CurrencyTotals;
  paid?: CurrencyTotals;
};

export type AdminOverviewInsight = {
  title: string;
  value: string;
  tone: 'neutral' | 'success' | 'warning';
  description: string;
};

export type AdminOverviewData = {
  summary: {
    locker_balance: ConvertedCurrencyTotals;
    capital_held: ConvertedCurrencyTotals;
    accrued_interest: ConvertedCurrencyTotals;
    interest_accrued_period: ConvertedCurrencyTotals;
    interest_paid_out_24h: ConvertedCurrencyTotals;
    deposits: ConvertedCurrencyTotals;
    withdrawals: ConvertedCurrencyTotals;
    penalties: ConvertedCurrencyTotals;
    disbursements: ConvertedCurrencyTotals;
    failed_debits: number;
    active_locker_users: number;
  };
  products: {
    self_lock: ProductOverviewTotals;
    goal_lock: ProductOverviewTotals;
    cabal: ProductOverviewTotals;
  };
  rates: Array<ActiveRateEntry>;
  charts: {
    flows: Array<OverviewChartPoint>;
    interest: Array<OverviewChartPoint>;
  };
  insights: Array<AdminOverviewInsight>;
  top_cabals: {
    cabals: Array<CabalSummary>;
    meta: PaginationType;
  };
  period: {
    from: string;
    to: string;
    range: OverviewRange;
    currency: OverviewCurrencyFilter;
  };
  data_quality: {
    paid_interest_note: string;
    unclassified_paid_interest_events: number;
  };
};

export type AdminOverviewParams = {
  range?: OverviewRange;
  from?: string;
  to?: string;
  currency?: OverviewCurrencyFilter;
  top_cabals_page?: number;
  top_cabals_limit?: number;
  top_cabals_search?: string;
  top_cabals_status?: Array<GroupSavingStatus>;
  top_cabals_currency?: Array<EntryCurrency>;
  top_cabals_sort_by?: 'created_at' | 'importance' | 'member_count' | 'total_contributed';
  top_cabals_order?: 'asc' | 'desc';
};
