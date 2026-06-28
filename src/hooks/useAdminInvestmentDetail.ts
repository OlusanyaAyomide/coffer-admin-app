import type {
  AdminInvestmentDetail,
  ItemResponse,
} from '@/types/InvestmentTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

export default function useAdminInvestmentDetail({
  investmentId,
  enabled = true,
}: {
  investmentId?: string;
  enabled?: boolean;
}) {
  const { data, isError, isLoading, refetch } = useGetRequest<
    ItemResponse<AdminInvestmentDetail>,
    QueryError
  >({
    URL: `/admin/investment/details/${investmentId ?? ''}`,
    queryKey: ['admin-investment-detail', investmentId ?? ''],
    enabled: Boolean(investmentId) && enabled,
  });

  return {
    investment: data?.data?.data ?? null,
    isDetailLoading: isLoading,
    isDetailError: isError,
    refetchDetail: refetch,
  };
}
