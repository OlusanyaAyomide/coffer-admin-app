import type { ActiveRateEntry } from '@/types/LockerTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type ActiveRatesResponse = {
  success: boolean;
  data: {
    rates: Array<ActiveRateEntry>;
  };
};

export default function useLockerRates() {
  const { data, isError, isLoading, refetch } = useGetRequest<
    ActiveRatesResponse,
    QueryError
  >({
    URL: '/admin/locker/rates',
    queryKey: ['locker-rates'],
    enabled: true,
  });

  return {
    rates: data?.data?.rates ?? [],
    isRatesLoading: isLoading,
    isRatesError: isError,
    refetchRates: refetch,
  };
}
