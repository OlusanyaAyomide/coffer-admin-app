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
