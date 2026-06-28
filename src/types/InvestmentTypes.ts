// Investment Types (snake_case from API)

export type UserInvestmentStatus = 'active' | 'matured' | 'withdrawn' | 'cancelled' | 'not_started';
export type InvestmentCurrency = 'NGN' | 'USDT';
export type InvestmentTransactionType = 'deposit' | 'withdrawal' | 'dividend' | 'maturity';
export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'upcoming';

// Investment data from getUserInvestments
export type UserInvestmentData = {
  id: string;
  reference: string;
  status: UserInvestmentStatus;
  total_units_purchased: number;
  total_value: string;
  dividends_received: string;
  next_dividend_date: string | null;
  created_at: string;
  investment: {
    id: string;
    title: string;
    category: string;
    price_per_unit: string;
    roi_percentage: string;
    start_date: string;
    maturity_date: string;
    currency: InvestmentCurrency;
    description: string;
  };
};

// Paginated response for getUserInvestments
export type UserInvestmentResponse = {
  success: boolean;
  data: {
    investments: Array<UserInvestmentData>;
    meta: PaginationType;
  };
};

// Single investment detail (getUserInvestmentById)
export type SingleInvestmentResponse = {
  success: boolean;
  data: UserInvestmentData;
};

// Investment transaction data
export type InvestmentTransactionData = {
  id: string;
  reference: string;
  type: string;
  amount: string;
  currency: InvestmentCurrency;
  status: string;
  description?: string;
  date: string;
  source?: 'investment_wallet' | 'transaction';
};

// Investment-specific transactions (getInvestmentTransactionsByInvestmentId)
export type InvestmentTransactionsResponse = {
  success: boolean;
  data: {
    investment: {
      id: string;
      title: string;
      reference: string;
    };
    transactions: Array<InvestmentTransactionData>;
    meta: PaginationType;
  };
};

// All investment transactions (getAllInvestmentTransactions)
export type AllInvestmentTransactionsData = {
  id: string;
  reference: string;
  investment_name: string;
  type: string;
  amount: string;
  currency: InvestmentCurrency;
  status: string;
  date: string;
};

export type AllInvestmentTransactionsResponse = {
  success: boolean;
  data: {
    transactions: Array<AllInvestmentTransactionsData>;
    meta: PaginationType;
  };
};

// Dividend schedule data
export type DividendScheduleData = {
  id: string;
  investment_name: string;
  amount: string;
  payment_date: string;
  status: 'completed' | 'upcoming';
};

// Recent dividends response (getRecentDividends)
export type RecentDividendsResponse = {
  success: boolean;
  data: {
    last_dividend: DividendScheduleData | null;
    upcoming_dividends: Array<DividendScheduleData>;
  };
};

// Pagination type (reused)
export type PaginationType = {
  total: number;
  page: number;
  limit: number;
  total_page: number;
  has_next_page: boolean;
  has_previous_page: boolean;
};

// ===========================================================================
// Admin Coffer (investment) management types — match the /admin/investment API
// ===========================================================================

export type AdminInvestmentStatus =
  | 'draft'
  | 'awaiting_start'
  | 'active'
  | 'matured'
  | 'cancelled';

export type DividendFrequency =
  | 'ending'
  | 'monthly'
  | 'quarterly'
  | 'semi_annually'
  | 'annually';

export type DividendType = 'interim_payout' | 'final_payout' | 'capital_payout';

// The global ResponseInterceptor wraps service returns. Service methods here
// return `{ data }` / `{ data, paginate }`, so the payload ends up double-nested
// at `response.data.data`, with pagination lifted to `response.meta`.
export type ListResponse<T> = {
  success: boolean;
  data: { data: Array<T> };
  meta: PaginationType;
};

export type ItemResponse<T> = {
  success: boolean;
  data: { data: T };
};

export type AdminInvestmentSummary = {
  id: string;
  title: string;
  description: string;
  status: AdminInvestmentStatus;
  category: { id: string; name: string } | null;
  sub_category: { id: string; name: string } | null;
  price_per_unit: string;
  total_value: string;
  currency: InvestmentCurrency;
  total_units: number;
  units_sold: number;
  roi_percentage: string;
  dividend_frequency: DividendFrequency | null;
  start_date: string;
  maturity_date: string;
  investment_duration_in_month: number;
  investor_count: number;
  tempoary_image_url: string | null;
  created_at: string;
};

export type AdminMediaDocument = {
  id: string;
  name?: string | null;
  size?: number | string | null;
  mime_type?: string | null;
  temporary_signed_url?: string | null;
};

export type AdminInvestmentImage = {
  id: string;
  document_id: string;
  caption: string | null;
  order: number;
  is_primary: boolean;
  media_type: 'image';
  document: AdminMediaDocument;
};

export type AdminInvestmentDocument = {
  id: string;
  document_id: string;
  caption: string | null;
  document_type: string | null;
  media_type: 'document';
  document: AdminMediaDocument;
};

export type AdminInvestmentFAQ = {
  id: string;
  question: string;
  answer: string;
  order: number;
};

export type AdminDividendSchedule = {
  id: string;
  schedule_reference: string | null;
  percentage_of_return: number;
  payment_date: string | null;
  type: DividendType;
  is_processed: boolean;
};

export type AdminInvestmentDetail = {
  id: string;
  title: string;
  description: string;
  sub_description: string | null;
  status: AdminInvestmentStatus;
  category: { id: string; name: string } | null;
  sub_category: { id: string; name: string } | null;
  category_id: string;
  sub_category_id: string | null;
  price_per_unit: string;
  minimum_units_purchasable: number;
  maximum_units_purchasable: number | null;
  currency: InvestmentCurrency;
  total_units: number;
  units_sold: number;
  roi_percentage: string;
  dividend_frequency: DividendFrequency | null;
  start_date: string;
  maturity_date: string;
  investment_duration_in_month: number;
  key_highlights: Record<string, unknown> | null;
  terms_conditions: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  images: Array<AdminInvestmentImage>;
  documents: Array<AdminInvestmentDocument>;
  faqs: Array<AdminInvestmentFAQ>;
  dividend_schedules: Array<AdminDividendSchedule>;
  _count?: { user_investments: number };
};

export type AdminInvestmentCategory = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  order: number;
  icon_id: string | null;
  Icon?: AdminMediaDocument | null;
  _count?: { sub_categories: number; investments: number };
};

export type AdminInvestmentSubCategory = {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  icon_id: string | null;
  Icon?: AdminMediaDocument | null;
};

export type InvestorRow = {
  id: string;
  reference: string;
  status: UserInvestmentStatus;
  total_units_purchased: number;
  total_value: string;
  currency: InvestmentCurrency;
  created_at: string;
  user: { id: string; name: string | null; email: string };
};

export type AdminDividendRow = {
  id: string;
  schedule_reference: string | null;
  percentage_of_return: number;
  payment_date: string | null;
  type: DividendType;
  is_processed: boolean;
  created_at: string;
  investment: {
    id: string;
    title: string;
    currency: InvestmentCurrency;
    roi_percentage: string;
  };
};

export type InvestmentStatsData = {
  total_investments: number;
  counts_by_status: Partial<Record<AdminInvestmentStatus, number>>;
  capital_raised: Record<string, number>;
  total_units: number;
  total_units_sold: number;
  total_investors: number;
  dividends: { total: number; processed: number; pending: number };
};

// ---- Request bodies ----
export type InvestmentDocumentInput = { upload_id: string; name: string };
export type InvestmentFAQInput = { question: string; answer: string };

export type CreateInvestmentBody = {
  title: string;
  description: string;
  sub_description?: string;
  category_id: string;
  sub_category_id?: string;
  price_per_unit: number;
  minimum_units_purchasable?: number;
  maximum_units_purchasable?: number;
  currency: InvestmentCurrency;
  total_units: number;
  roi_percentage: number;
  dividend_frequency?: DividendFrequency;
  start_date: string;
  investment_duration_in_month: number;
  image_ids: Array<string>;
  document_ids?: Array<InvestmentDocumentInput>;
  key_highlights?: Record<string, unknown>;
  terms_conditions?: string;
  faqs?: Array<InvestmentFAQInput>;
};

export type UpdateInvestmentBody = {
  title?: string;
  description?: string;
  sub_description?: string;
  category_id?: string;
  sub_category_id?: string;
  price_per_unit?: number;
  minimum_units_purchasable?: number;
  maximum_units_purchasable?: number;
  total_units?: number;
  roi_percentage?: number;
  key_highlights?: Record<string, unknown>;
  terms_conditions?: string;
  start_date?: string;
  investment_duration_in_month?: number;
  dividend_frequency?: DividendFrequency;
  image_ids_to_remove?: Array<string>;
  image_ids_to_add?: Array<string>;
  document_ids_to_remove?: Array<string>;
  document_ids_to_add?: Array<InvestmentDocumentInput>;
};
