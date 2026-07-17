import type { LedgerResponse } from '@/types/FinancialsTypes'
import type { PaginationType, QueryError } from '@/types/ResponseTypes'
import useGetRequest from '@/hooks/useGetRequests'
import { LONG_ITEMS_COUNT_PER_PAGE } from '@/constants/Constants'

export type LedgerParams = {
  page: number
  flow?: Array<string>
  status?: Array<string>
  provider?: Array<string>
  currency?: Array<string>
  duration?: { duration_start?: string; duration_end?: string } | null
  search?: string
  hasNoEntries?: boolean
  isStuck?: boolean
}

const EMPTY_META: PaginationType = {
  total: 0,
  page: 1,
  limit: LONG_ITEMS_COUNT_PER_PAGE,
  total_page: 1,
  has_next_page: false,
  has_previous_page: false,
}

export default function useFinancialsLedger({
  page,
  flow = [],
  status = [],
  provider = [],
  currency = [],
  duration,
  search,
  hasNoEntries,
  isStuck,
}: LedgerParams) {
  const params: Record<string, string | number | boolean | Array<string>> = {
    page,
    limit: LONG_ITEMS_COUNT_PER_PAGE,
    // The backend defaults to a 30d window; the ledger is an investigation tool, so it must
    // reach the whole history unless a date filter is applied.
    range: duration?.duration_start ? 'custom' : 'all',
  }

  if (flow.length > 0) params.flow = flow
  if (status.length > 0) params.status = status
  if (provider.length > 0) params.provider = provider
  if (currency.length > 0) params.currency = currency
  if (search) params.search = search
  if (hasNoEntries) params.has_no_entries = true
  if (isStuck) params.is_stuck = true
  if (duration?.duration_start) params.from = duration.duration_start
  if (duration?.duration_end) params.to = duration.duration_end

  const { data, isError, isLoading, refetch } = useGetRequest<
    LedgerResponse,
    QueryError
  >({
    URL: '/admin/financials/transactions',
    queryKey: ['financials-ledger'],
    params,
  })

  return {
    transactions: data?.data?.transactions ?? [],
    summary: data?.data?.summary ?? null,
    ledgerMeta: data?.meta ?? EMPTY_META,
    isLedgerLoading: isLoading,
    isLedgerError: isError,
    refetchLedger: refetch,
  }
}
