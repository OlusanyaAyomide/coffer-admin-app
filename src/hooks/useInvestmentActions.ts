import { useQueryClient } from '@tanstack/react-query'

import type {
  AdminInvestmentDetail,
  AdminInvestmentStatus,
  ItemResponse,
  UpdateDividendSchedulesBody,
} from '@/types/InvestmentTypes'
import type { SlashStringType } from '@/types/GenericTypes'
import usePostRequest from '@/hooks/usePostRequests'

export function useUpdateInvestmentStatus({
  investmentId,
  onSuccess,
}: {
  investmentId: string
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const URL: SlashStringType = `/admin/investment/${investmentId}/status`

  const { mutate, isPending } = usePostRequest<
    { data: AdminInvestmentDetail },
    { status: AdminInvestmentStatus }
  >({
    URL,
    isPatch: true,
    mutationKey: ['investment-status', investmentId],
    successText: 'Investment status updated',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-investment-detail'] })
      queryClient.invalidateQueries({ queryKey: ['admin-investment-stats'] })
      onSuccess?.()
    },
  })

  return { updateStatus: mutate, isUpdatingStatus: isPending }
}

export function useDeleteInvestment({
  investmentId,
  onSuccess,
}: {
  investmentId: string
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const URL: SlashStringType = `/admin/investment/${investmentId}`

  const { mutate, isPending } = usePostRequest<{ message: string }, undefined>({
    URL,
    isDelete: true,
    mutationKey: ['investment-delete', investmentId],
    successText: 'Investment deleted',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investments'] })
      queryClient.invalidateQueries({ queryKey: ['admin-investment-stats'] })
      onSuccess?.()
    },
  })

  return { deleteInvestment: mutate, isDeletingInvestment: isPending }
}

export function useUpdateInvestmentScheduleDates({
  investmentId,
  onSuccess,
}: {
  investmentId: string
  onSuccess?: () => void
}) {
  const queryClient = useQueryClient()
  const URL: SlashStringType = `/admin/investment/${investmentId}/dividend-schedules`

  const { mutate, isPending } = usePostRequest<
    ItemResponse<AdminInvestmentDetail>,
    UpdateDividendSchedulesBody
  >({
    URL,
    isPatch: true,
    mutationKey: ['investment-schedule-dates', investmentId],
    successText: 'Schedule updated',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investment-detail'] })
      queryClient.invalidateQueries({
        queryKey: ['admin-investment-dividends'],
      })
      queryClient.invalidateQueries({ queryKey: ['admin-investment-stats'] })
      onSuccess?.()
    },
  })

  return { updateScheduleDates: mutate, isUpdatingScheduleDates: isPending }
}
