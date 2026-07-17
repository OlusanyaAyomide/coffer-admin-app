import type { TransactionDetailResponse } from '@/types/FinancialsTypes'
import type { QueryError } from '@/types/ResponseTypes'
import useGetRequest from '@/hooks/useGetRequests'

export default function useFinancialsTransactionDetail(
  transactionId: string | null,
) {
  const { data, isError, isLoading } = useGetRequest<
    TransactionDetailResponse,
    QueryError
  >({
    URL: `/admin/financials/transactions/${transactionId}`,
    queryKey: ['financials-transaction-detail', transactionId ?? 'none'],
    enabled: Boolean(transactionId),
  })

  return {
    transaction: data?.data?.transaction ?? null,
    integrity: data?.data?.integrity ?? null,
    isDetailLoading: isLoading,
    isDetailError: isError,
  }
}
