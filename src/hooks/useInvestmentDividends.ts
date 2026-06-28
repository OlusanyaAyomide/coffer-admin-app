import type {
  AdminDividendRow,
  DividendType,
  ListResponse,
} from '@/types/InvestmentTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

export default function useInvestmentDividends({
  page = 1,
  limit = 20,
  is_processed,
  type,
  investment_id,
}: {
  page?: number;
  limit?: number;
  is_processed?: boolean;
  type?: DividendType;
  investment_id?: string;
} = {}) {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (is_processed !== undefined) params.is_processed = is_processed;
  if (type) params.type = type;
  if (investment_id) params.investment_id = investment_id;

  const { data, isError, isLoading, refetch } = useGetRequest<
    ListResponse<AdminDividendRow>,
    QueryError
  >({
    URL: '/admin/investment/dividends',
    queryKey: [
      'admin-investment-dividends',
      String(page),
      String(is_processed ?? ''),
      type ?? '',
      investment_id ?? '',
    ],
    params,
  });

  return {
    dividends: data?.data?.data ?? [],
    meta: data?.meta ?? null,
    isDividendsLoading: isLoading,
    isDividendsError: isError,
    refetchDividends: refetch,
  };
}
