import type {
  ActivePreLiquidationPolicyEntry,
  LockerType,
} from '@/types/LockerTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type PolicyResponse = {
  success: boolean;
  data: ActivePreLiquidationPolicyEntry;
};

export default function useLockerPreLiquidationPolicy(type: LockerType) {
  const { data, isError, isLoading, refetch } = useGetRequest<
    PolicyResponse,
    QueryError
  >({
    URL: `/admin/locker/pre-liquidation-penalty/${type}`,
    queryKey: ['locker-pre-liquidation-policy', type],
    enabled: true,
  });

  return {
    policyEntry: data?.data,
    isPolicyLoading: isLoading,
    isPolicyError: isError,
    refetchPolicy: refetch,
  };
}
