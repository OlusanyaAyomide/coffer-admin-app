import type { UserLockerActivity } from '@/types/LockerTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type UserLockerActivitiesResponse = {
  success: boolean;
  data: { recent_activity: Array<UserLockerActivity> };
  meta: PaginationType;
};

export default function useUserLockerActivities({
  userId,
  page = 1,
  limit = 10,
}: {
  userId: string;
  page?: number;
  limit?: number;
}) {
  const { data, isError, isLoading, refetch } = useGetRequest<
    UserLockerActivitiesResponse,
    QueryError
  >({
    URL: `/admin/customer/${userId}/locker/activities`,
    queryKey: ['user-locker-activities', userId, String(page), String(limit)],
    enabled: Boolean(userId),
    params: { page, limit },
  });

  return {
    activities: data?.data?.recent_activity ?? [],
    meta: data?.meta ?? null,
    isActivitiesLoading: isLoading,
    isActivitiesError: isError,
    refetchActivities: refetch,
  };
}
