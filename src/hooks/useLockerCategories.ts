import type { SavingCategoryType, SavingsCategory } from '@/types/LockerTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type LockerCategoriesParams = {
  page?: number;
  limit?: number;
  search?: string;
  type?: SavingCategoryType;
  is_active?: boolean;
  sort_by?: 'sort_order' | 'created_at' | 'updated_at';
  order?: 'asc' | 'desc';
};

type LockerCategoriesResponse = {
  success: boolean;
  data: {
    categories: Array<SavingsCategory>;
  };
  meta: PaginationType;
};

const ITEMS_PER_PAGE = 20;

export default function useLockerCategories({
  page = 1,
  limit = ITEMS_PER_PAGE,
  search,
  type,
  is_active,
  sort_by = 'created_at',
  order = 'desc',
}: LockerCategoriesParams = {}) {
  const params: Record<string, string | number | boolean> = {
    page,
    limit,
    sort_by,
    order,
  };
  if (search) params.search = search;
  if (type) params.type = type;
  if (is_active !== undefined) params.is_active = is_active;

  const { data, isError, isLoading, refetch } = useGetRequest<
    LockerCategoriesResponse,
    QueryError
  >({
    URL: '/admin/locker/categories',
    queryKey: [
      'locker-categories',
      String(page),
      String(limit),
      search ?? '',
      type ?? '',
      String(is_active ?? ''),
      sort_by,
      order,
    ],
    enabled: true,
    params,
  });

  return {
    categories: data?.data?.categories ?? [],
    meta: data?.meta ?? null,
    isCategoriesLoading: isLoading,
    isCategoriesError: isError,
    refetchCategories: refetch,
  };
}
