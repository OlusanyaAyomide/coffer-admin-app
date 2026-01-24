// User management types

import type { NullableType } from '@/types/GenericTypes';

export type UserData = {
  id: string;
  user_id: string;
  first_name: NullableType<string>;
  last_name: NullableType<string>;
  email: string;
  kyc_status: 'verified' | 'pending' | 'rejected' | 'not_started';
  account_status: 'active' | 'suspended' | 'inactive';
  balance: NullableType<number>;
  naira_balance: NullableType<number>;
  usdt_balance: NullableType<number>;
  risk_level: NullableType<'low' | 'medium' | 'high'>;
  country_id: NullableType<string>;
  country_name: NullableType<string>;
  last_active: NullableType<string>;
  created_at: string;
  profile_image: NullableType<{
    id: string;
    url: string;
  }>;
};

export type UserListResponse = {
  data: {
    users: Array<UserData>;
  };
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

export type UserStats = {
  total_users: number;
  active_users: number;
  pending_kyc: number;
  suspended: number;
  growth_percentage: number;
};

// User Overview Cards Response
export type UserOverviewCardsData = {
  usdt_balance: string;
  ngn_balance: string;
  total_sent: string;
  referral_earnings: string;
};

// Reusable enums
export const AccountTier = {
  BAND_A: 'band_a',
  BAND_B: 'band_b',
  BAND_C: 'band_c',
} as const;

export type AccountTierType = (typeof AccountTier)[keyof typeof AccountTier];

export const KycTierStatus = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  NOT_STARTED: 'not_started',
} as const;

export type KycTierStatusType = (typeof KycTierStatus)[keyof typeof KycTierStatus];

// KYC Tier data
export type KycTier = {
  tier: AccountTierType;
  label: string;
  status: KycTierStatusType;
  completed_at: string | null;
};

// Admin Note
export type AdminNote = {
  id: string;
  title?: string;
  author_name: string;
  author_initial: string;
  content: string;
  created_at: string;
};

// User Header Data (for UserDetailsHeader component)
export type UserHeaderData = {
  full_name: string;
  coffer_id: string;
  email: string;
  status: 'active' | 'under_revieiw' | 'deactivated';
  country_name: string | null;
  tier_label: string;
  last_active: string;
  profile_image: { id: string; url: string } | null;
};

// Account Overview Response
export type AccountOverviewData = {
  user_header: UserHeaderData;
  joining_date: string;
  last_login: { date: string; ip_address: string | null } | null;
  email_verified: boolean;
  referral_status: { is_referred: boolean; referrer_coffer_id: string | null };
  kyc_tiers: Array<KycTier>;
  admin_notes: Array<AdminNote>;
};

// Currency type for wallet ledger
export type CurrencyType = 'USD' | 'NGN';

// Wallet Ledger Response
export type ExchangeRate = {
  buy_rate: number;
  sell_rate: number;
  from_currency: string;
  to_currency: string;
};

export type WalletLedgerData = {
  fiat_wallet_balance_ngn: string;
  crypto_wallet_balance_usdt: string;
  investment_wallet_ngn: string;
  investment_wallet_usdt: string;
  total_portfolio_in_ngn: string;
  total_portfolio_in_usd: string;
  wallet_balance_in_ngn: string;
  wallet_balance_in_usd: string;
  currency_distribution_ngn: {
    ngn: string;
    usd: string;
  };
  currency_distribution_usd: {
    ngn: string;
    usd: string;
  };
  exchange_rate: ExchangeRate;
  locker_balance_ngn: string;
  locker_balance_usdt: string;
};

export type WalletLedgerResponse = {
  success: boolean;
  data: WalletLedgerData;
};

// Transaction History Types
export type TransactionHistoryItem = {
  id: string;
  reference: string;
  amount: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'reversed' | 'cancelled';
  category: string;
  direction: 'debit' | 'credit' | null;
  description: string | null;
  wallet_type: 'fiat' | 'crypto';
  wallet_id: string | null;
  created_at: string;
  meta_data?: any;
};

export type TransactionEntry = {
  id: string;
  amount: string;
  currency: string;
  direction: 'debit' | 'credit';
  source_details: string;
  destination_details: string;
  created_at: string;
};

export type TransactionCharge = {
  id: string;
  amount: string;
  currency: string;
  type: string;
};

export type TransactionDetails = TransactionHistoryItem & {
  rate?: string;
  entries: TransactionEntry[];
  charges: TransactionCharge[];
};

import type { PaginationType } from '@/types/ResponseTypes';

export type TransactionHistoryResponse = {
  success: boolean;
  data: {
    data: Array<TransactionHistoryItem>;
  };
  meta: PaginationType;
};

export type SingleTransactionResponse = {
  success: boolean;
  data: TransactionDetails;
};
