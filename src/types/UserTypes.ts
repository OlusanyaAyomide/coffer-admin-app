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
