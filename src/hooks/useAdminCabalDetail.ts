import type { CabalDetailResponseData } from '@/types/LockerTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type AdminCabalDetailResponse = {
  success: boolean;
  data: CabalDetailResponseData;
};

export default function useAdminCabalDetail({
  cabalId,
  enabled = true,
}: {
  cabalId?: string;
  enabled?: boolean;
}) {
  const { data, isError, isLoading, refetch } = useGetRequest<
    AdminCabalDetailResponse,
    QueryError
  >({
    URL: `/admin/locker/cabal/${cabalId ?? ''}`,
    queryKey: ['admin-cabal-detail', cabalId ?? ''],
    enabled: Boolean(cabalId) && enabled,
  });

  return {
    detail: data?.data ?? null,
    isCabalDetailLoading: isLoading,
    isCabalDetailError: isError,
    refetchCabalDetail: refetch,
  };
}
