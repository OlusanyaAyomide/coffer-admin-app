import type { LockerType, SavingsRate } from '@/types/LockerTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type RateHistoryParams = {
  /** Required — each product has its own paginated endpoint. */
  type: LockerType;
  page?: number;
  limit?: number;
};

type RateHistoryResponse = {
  success: boolean;
  data: {
    rates: Array<SavingsRate>;
  };
  meta: PaginationType;
};

const ITEMS_PER_PAGE = 10;

export default function useLockerRateHistory({
  type,
  page = 1,
  limit = ITEMS_PER_PAGE,
}: RateHistoryParams) {
  const { data, isError, isLoading, refetch } = useGetRequest<
    RateHistoryResponse,
    QueryError
  >({
    URL: `/admin/locker/rates/history/${type}`,
    queryKey: ['locker-rate-history', type, String(page)],
    enabled: true,
    params: { page, limit },
  });

  return {
    history: data?.data?.rates ?? [],
    meta: data?.meta ?? null,
    isHistoryLoading: isLoading,
    isHistoryError: isError,
    refetchHistory: refetch,
  };
}
