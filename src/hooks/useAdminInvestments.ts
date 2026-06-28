import type {
  AdminInvestmentStatus,
  AdminInvestmentSummary,
  InvestmentCurrency,
  ListResponse,
} from '@/types/InvestmentTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type AdminInvestmentsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: AdminInvestmentStatus;
  category_id?: string;
  sub_category_id?: string;
  currency?: InvestmentCurrency;
  enabled?: boolean;
};

export default function useAdminInvestments({
  page = 1,
  limit = 20,
  search,
  status,
  category_id,
  sub_category_id,
  currency,
  enabled = true,
}: AdminInvestmentsParams = {}) {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (search) params.search = search;
  if (status) params.status = status;
  if (category_id) params.category_id = category_id;
  if (sub_category_id) params.sub_category_id = sub_category_id;
  if (currency) params.currency = currency;

  const { data, isError, isLoading, refetch } = useGetRequest<
    ListResponse<AdminInvestmentSummary>,
    QueryError
  >({
    URL: '/admin/investment/list',
    queryKey: [
      'admin-investments',
      String(page),
      String(limit),
      search ?? '',
      status ?? '',
      category_id ?? '',
      sub_category_id ?? '',
      currency ?? '',
    ],
    params,
    enabled,
  });

  return {
    investments: data?.data?.data ?? [],
    meta: data?.meta ?? null,
    isInvestmentsLoading: isLoading,
    isInvestmentsError: isError,
    refetchInvestments: refetch,
  };
}
