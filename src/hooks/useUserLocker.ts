import type { UserLockerData } from '@/types/LockerTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type UserLockerResponse = {
  success: boolean;
  data: UserLockerData;
};

export default function useUserLocker({ userId }: { userId: string }) {
  const { data, isError, isLoading, refetch } = useGetRequest<
    UserLockerResponse,
    QueryError
  >({
    URL: `/admin/customer/${userId}/locker`,
    queryKey: ['user-locker', userId],
    enabled: Boolean(userId),
  });

  return {
    lockerData: data?.data ?? null,
    isLockerLoading: isLoading,
    isLockerError: isError,
    refetchLocker: refetch,
  };
}
