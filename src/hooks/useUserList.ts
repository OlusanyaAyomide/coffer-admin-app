import useGetRequest from '@/hooks/useGetRequests';
import type { QueryError, PaginationType } from '@/types/ResponseTypes';
import type { UserData } from '@/types/UserTypes';
import { convertDateToTimeRange } from '@/services/TimeServices';

type UserListParams = {
  search_term?: string;
  kyc_status?: string[];
  account_status?: string[];
  risk_level?: string[];
  country?: string[];
  joined_at?: string[];
  page?: number;
  limit?: number;
};

type UserListResponse = {
  success: boolean;
  data: {
    users: UserData[];
    paginate: PaginationType;
  };
  meta: PaginationType;
};

const ITEMS_PER_PAGE = 10;

export default function useUserList({
  search_term,
  kyc_status,
  account_status,
  risk_level,
  country,
  joined_at,
  page = 1,
  limit = ITEMS_PER_PAGE,
}: UserListParams) {
  // Convert date range to start/end params
  const dateRange = convertDateToTimeRange('joined_at', joined_at || []);

  const params: Record<string, string | number | string[]> = {
    page,
    limit,
  };

  // Add optional filters
  if (search_term) {
    params.search_term = search_term;
  }
  if (kyc_status?.length) {
    params['kyc_status[]'] = kyc_status;
  }
  if (account_status?.length) {
    params['account_status[]'] = account_status;
  }
  if (risk_level?.length) {
    params['risk_level[]'] = risk_level;
  }
  if (country?.length) {
    params['country[]'] = country;
  }
  if (dateRange) {
    params.joined_at_start = dateRange.joined_at_start;
    params.joined_at_end = dateRange.joined_at_end;
  }

  const { data, isError, isLoading, refetch } = useGetRequest<UserListResponse, QueryError>({
    URL: '/admin/customer/users',
    queryKey: ['user-list', String(page)],
    enabled: true,
    params,
  });

  return {
    users: data?.data?.users ?? [],
    meta: data?.meta ?? data?.data?.paginate ?? null,
    isUsersLoading: isLoading,
    isUsersError: isError,
    refetchUsers: refetch,
  };
}
