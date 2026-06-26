import type {
  CabalSummary,
  ContributionFrequency,
  EntryCurrency,
  GroupSavingStatus,
} from '@/types/LockerTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type AdminCabalsParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: Array<GroupSavingStatus>;
  currency?: Array<EntryCurrency>;
  category_id?: string;
  contribution_frequency?: Array<ContributionFrequency>;
  is_featured?: boolean;
  is_company_group?: boolean;
  sort_by?: 'created_at' | 'importance' | 'member_count' | 'total_contributed';
  order?: 'asc' | 'desc';
};

type AdminCabalsResponse = {
  success: boolean;
  data: {
    cabals: Array<CabalSummary>;
  };
  meta: PaginationType;
};

export default function useAdminCabals({
  page = 1,
  limit = 20,
  search,
  status,
  currency,
  category_id,
  contribution_frequency,
  is_featured,
  is_company_group,
  sort_by = 'created_at',
  order = 'desc',
}: AdminCabalsParams = {}) {
  const params: Record<string, string | number | boolean | Array<string>> = {
    page,
    limit,
    sort_by,
    order,
  };
  if (search) params.search = search;
  if (status?.length) params.status = status;
  if (currency?.length) params.currency = currency;
  if (category_id) params.category_id = category_id;
  if (contribution_frequency?.length) {
    params.contribution_frequency = contribution_frequency;
  }
  if (is_featured !== undefined) params.is_featured = is_featured;
  if (is_company_group !== undefined) params.is_company_group = is_company_group;

  const { data, isError, isLoading, refetch } = useGetRequest<
    AdminCabalsResponse,
    QueryError
  >({
    URL: '/admin/locker/cabals',
    queryKey: [
      'admin-cabals',
      String(page),
      String(limit),
      search ?? '',
      status?.join(',') ?? '',
      currency?.join(',') ?? '',
      category_id ?? '',
      contribution_frequency?.join(',') ?? '',
      String(is_featured ?? ''),
      String(is_company_group ?? ''),
      sort_by,
      order,
    ],
    params,
  });

  return {
    cabals: data?.data?.cabals ?? [],
    meta: data?.meta ?? null,
    isCabalsLoading: isLoading,
    isCabalsError: isError,
    refetchCabals: refetch,
  };
}
