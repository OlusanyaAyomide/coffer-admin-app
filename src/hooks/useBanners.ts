import type { Banner, BannerStatus } from '@/types/BannerTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type BannersParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: BannerStatus;
  sort_by?: 'sort_order' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
};

type BannersResponse = {
  success: boolean;
  data: {
    banners: Array<Banner>;
  };
  meta: PaginationType;
};

const ITEMS_PER_PAGE = 20;

export default function useBanners({
  page = 1,
  limit = ITEMS_PER_PAGE,
  search,
  status,
  sort_by = 'sort_order',
  order = 'asc',
}: BannersParams = {}) {
  const params: Record<string, string | number | boolean> = {
    page,
    limit,
    sort_by,
    order,
  };
  if (search) params.search = search;
  if (status) params.status = status;

  const { data, isError, isLoading, refetch } = useGetRequest<
    BannersResponse,
    QueryError
  >({
    URL: '/admin/banners',
    queryKey: [
      'banners',
      String(page),
      String(limit),
      search ?? '',
      status ?? '',
      sort_by,
      order,
    ],
    enabled: true,
    params,
  });

  return {
    banners: data?.data?.banners ?? [],
    meta: data?.meta ?? null,
    isBannersLoading: isLoading,
    isBannersError: isError,
    refetchBanners: refetch,
  };
}
