// User management types

export type UserData = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  kyc_status: 'verified' | 'pending' | 'rejected' | 'not_started';
  account_status: 'active' | 'suspended' | 'inactive';
  balance: number;
  naira_balance: number;
  usdt_balance: number;
  risk_level: 'low' | 'medium' | 'high';
  country_id: string;
  last_active: string;
  created_at: string;
};

export type UserListResponse = {
  data: {
    users: UserData[];
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
