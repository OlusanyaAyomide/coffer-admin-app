import type {
  OverviewCurrency,
  OverviewRange,
  OverviewResponse,
} from '@/types/FinancialsTypes'
import type { QueryError } from '@/types/ResponseTypes'
import useGetRequest from '@/hooks/useGetRequests'

type UseFinancialsOverviewParams = {
  range: OverviewRange | 'custom'
  currency: OverviewCurrency
  /** ISO strings, only sent (and required) when range is 'custom'. */
  from?: string
  to?: string
}

export default function useFinancialsOverview({
  range,
  currency,
  from,
  to,
}: UseFinancialsOverviewParams) {
  const isCustom = range === 'custom'
  const params: Record<string, string> = { range, currency }
  if (isCustom && from) params.from = from
  if (isCustom && to) params.to = to

  const { data, isError, isLoading, refetch, isFetching } = useGetRequest<
    OverviewResponse,
    QueryError
  >({
    URL: '/admin/financials/overview',
    queryKey: ['financials-overview'],
    // Don't fire a custom-range request until both ends are chosen.
    enabled: !isCustom || Boolean(from && to),
    params,
  })

  return {
    overview: data?.data ?? null,
    isOverviewLoading: isLoading,
    isOverviewFetching: isFetching,
    isOverviewError: isError,
    refetchOverview: refetch,
  }
}
