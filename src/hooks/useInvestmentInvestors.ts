import type {
  InvestorRow,
  ListResponse,
  UserInvestmentStatus,
} from '@/types/InvestmentTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

export default function useInvestmentInvestors({
  investmentId,
  page = 1,
  limit = 20,
  status,
  enabled = true,
}: {
  investmentId?: string;
  page?: number;
  limit?: number;
  status?: UserInvestmentStatus;
  enabled?: boolean;
}) {
  const params: Record<string, string | number> = { page, limit };
  if (status) params.status = status;

  const { data, isError, isLoading, refetch } = useGetRequest<
    ListResponse<InvestorRow>,
    QueryError
  >({
    URL: `/admin/investment/${investmentId ?? ''}/investors`,
    queryKey: ['admin-investment-investors', investmentId ?? '', String(page), status ?? ''],
    params,
    enabled: Boolean(investmentId) && enabled,
  });

  return {
    investors: data?.data?.data ?? [],
    meta: data?.meta ?? null,
    isInvestorsLoading: isLoading,
    isInvestorsError: isError,
    refetchInvestors: refetch,
  };
}
