import useGetRequest from '@/hooks/useGetRequests';
import type { QueryError, PaginationType } from '@/types/ResponseTypes';
import type { UserStats } from '@/types/UserTypes';

type UserStatsResponse = {
  success: boolean;
  data: UserStats;
};

export default function useUserStats() {
  const { data, isError, isLoading, refetch } = useGetRequest<UserStatsResponse, QueryError>({
    URL: '/admin/customer/stats',
    queryKey: ['user-stats'],
    enabled: true,
  });

  return {
    stats: data?.data ?? null,
    isStatsLoading: isLoading,
    isStatsError: isError,
    refetchStats: refetch,
  };
}
