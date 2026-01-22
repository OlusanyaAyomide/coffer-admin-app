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
