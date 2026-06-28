import type {
  InvestmentStatsData,
  ItemResponse,
} from '@/types/InvestmentTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

export default function useInvestmentStats() {
  const { data, isError, isLoading, refetch } = useGetRequest<
    ItemResponse<InvestmentStatsData>,
    QueryError
  >({
    URL: '/admin/investment/stats',
    queryKey: ['admin-investment-stats'],
  });

  return {
    stats: data?.data?.data ?? null,
    isStatsLoading: isLoading,
    isStatsError: isError,
    refetchStats: refetch,
  };
}
