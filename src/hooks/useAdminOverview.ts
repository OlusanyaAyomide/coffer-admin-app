import type {
  AdminOverviewData,
  AdminOverviewParams,
} from '@/types/AdminOverviewTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type AdminOverviewResponse = {
  success: boolean;
  data?: AdminOverviewData;
} & AdminOverviewData;

export default function useAdminOverview(params: AdminOverviewParams) {
  const queryParams: Record<string, string | number | Array<string>> = {};

  if (params.range) queryParams.range = params.range;
  if (params.from) queryParams.from = params.from;
  if (params.to) queryParams.to = params.to;
  if (params.currency) queryParams.currency = params.currency;
  if (params.top_cabals_page) queryParams.top_cabals_page = params.top_cabals_page;
  if (params.top_cabals_limit) queryParams.top_cabals_limit = params.top_cabals_limit;
  if (params.top_cabals_search) {
    queryParams.top_cabals_search = params.top_cabals_search;
  }
  if (params.top_cabals_status?.length) {
    queryParams.top_cabals_status = params.top_cabals_status;
  }
  if (params.top_cabals_currency?.length) {
    queryParams.top_cabals_currency = params.top_cabals_currency;
  }
  if (params.top_cabals_sort_by) {
    queryParams.top_cabals_sort_by = params.top_cabals_sort_by;
  }
  if (params.top_cabals_order) queryParams.top_cabals_order = params.top_cabals_order;

  const { data, isLoading, isError, refetch } = useGetRequest<
    AdminOverviewResponse,
    QueryError
  >({
    URL: '/admin/overview',
    queryKey: ['admin-overview'],
    params: queryParams,
  });

  return {
    overview: data?.data ?? data ?? null,
    isOverviewLoading: isLoading,
    isOverviewError: isError,
    refetchOverview: refetch,
  };
}
