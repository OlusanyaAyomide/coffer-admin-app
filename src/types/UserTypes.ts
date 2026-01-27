import type { NullableType } from '@/types/GenericTypes';

import type { PaginationType } from '@/types/ResponseTypes';

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
  order?: number; // Added optional to prevent strict errors if used
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
  entries: Array<TransactionEntry>;
  charges: Array<TransactionCharge>;
};

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

// --- Security & Verification Types ---

export type VerificationItem = {
  id: string;
  title: string;
  status: 'verified' | 'enabled' | 'pending' | 'not_verified';
  statusLabel: string;
  description: string;
  icon: 'kyc' | 'email' | '2fa';
  tierBadge?: string;
  date?: string;
};

export interface SecurityEvent {
  id: string;
  event: string;
  ipAddress: string;
  dateTime: string;
  status: 'success' | 'completed' | 'failed' | 'warning';
}

export type PermissionUpdateDto = {
  can_withdraw?: boolean;
  can_deposit?: boolean;
  can_swap?: boolean;
  can_purchase_investment?: boolean;
  can_save?: boolean;
  can_log_in?: boolean;
};

export type SecurityOverviewResponse = {
  success: boolean;
  data: {
    verification_state: Array<VerificationItem>;
    permissions: Record<string, boolean>;
    kyc_notes: Array<AdminNote>;
    is_account_locked: boolean;
    country_code: string;
    latest_kyc_submission_id?: string;
    current_tier: string; // AccountTier
    is_two_fa_enabled: boolean;
  };
};

export type SecurityEventsResponse = {
  success: boolean;
  data: Array<SecurityEvent>;
};

export type KycDocument = {
  id: string;
  submission_id: string;
  type: string;
  title: string;
  subtitle?: string;
  status: 'accepted' | 'pending' | 'rejected' | 'invalidated';
  uploaded_date: string;
  thumbnail_url: string;
  mime_type?: string;
  associated_tier: AccountTierType;
  // mapped fields for UI if needed
  documentId?: string;
  issueDate?: string;
  expiryDate?: string;
};

export type KycDocumentsResponse = {
  success: boolean;
  data: {
    kyc_status: string;
    current_documents: Array<KycDocument>;
    history_documents: Array<KycDocument>;
  };
};

export interface KycStatsData {
  total_kyc: number;
  this_week: number;
  pending_review: number;
  processed_kyc: number;
  approved: number;
  rejected: number;
}

export interface KycStatsResponse {
  success: boolean;
  data: KycStatsData;
}

export interface KycSubmission {
  id: string;
  user_id: string; // Coffer ID
  user_uuid?: string; // DB UUID for navigation
  user_name: string;
  user_email: string;
  user_avatar?: string | null;
  kyc_band: any; // AccountTier
  status: any; // KycSubmissionStatus
  country: string;
  document_type: string;
  submitted_at: string;
  reviewed_at?: string | null;
}

export interface KycListResponse {
  success: boolean;
  data: {
    data: KycSubmission[];
    meta: PaginationType;
  };
}

export interface KycHistoryItem {
  id: string;
  status: string;
  created_at: string;
  processed_at?: string;
  text_content?: string;
  rejection_reason?: string;
  additional_info_requested?: string;
  proof_of_identity_document?: KycDocumentField;
  proof_of_identity_back_view?: KycDocumentField;
  face_image?: KycDocumentField;
  proof_of_address_document?: KycDocumentField;
  proof_of_income_document?: KycDocumentField;
}

export interface KycDocumentField {
  id: string;
  temporary_signed_url: string;
  mime_type: string;
}

export interface KycSubmittedDataWithUrls {
  id: string;
  kyc_overview_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  country: string;
  proof_of_identity_type: string;
  associated_with: string;

  // Personal Info
  first_name?: string;
  last_name?: string;
  middle_name?: string;
  date_of_birth?: string;
  phone_number?: string;

  // Identity Info
  proof_of_identity_number?: string;
  expiry_date?: string;

  // Address Info
  city?: string;
  state?: string;
  postal_code?: string;
  street_address?: string;
  second_city?: string;
  second_state?: string;
  second_postal_code?: string;
  second_street_address?: string;
  proof_of_address_type?: string;

  // Income Info
  income_source?: string;
  income_range_start?: number;
  income_range_end?: number;

  additional_info_requested?: string;
  text_content?: string;
  proof_of_identity_document?: KycDocumentField;
  proof_of_identity_back_view?: KycDocumentField;
  face_image?: KycDocumentField;
  proof_of_address_document?: KycDocumentField;
  proof_of_income_document?: KycDocumentField;
}

export interface KycDetailsResponse {
  data: {
    kyc: KycSubmittedDataWithUrls;
    history: KycHistoryItem[];
    accepted_submissions: KycSubmittedDataWithUrls[];
    notes: AdminNote[];
    user: {
      id: string;
      coffer_id: string;
      first_name: string;
      last_name: string;
      email: string;
      avatar?: string;
      country?: string;
      account_tier?: AccountTierType;
    };
  };
}

// Activity Logs
export interface UserActivityLog {
  id: string;
  type: string;
  description: string;
  ip_address: string;
  device: string;
  location: string;
  status: string;
  severity: 'low' | 'moderate' | 'high' | 'emergency';
  created_at: string;
  metadata?: any;
}

export type UserActivityLogResponse = {
  success: boolean;
  data: {
    logs: UserActivityLog[];
    paginate: PaginationType;
  };
};
