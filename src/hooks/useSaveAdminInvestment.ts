import { useQueryClient } from '@tanstack/react-query';

import type {
  AdminInvestmentDetail,
  CreateInvestmentBody,
  ItemResponse,
  UpdateInvestmentBody,
} from '@/types/InvestmentTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

type SaveResponse = ItemResponse<AdminInvestmentDetail>;

export default function useSaveAdminInvestment({
  investmentId,
  onSuccess,
}: {
  investmentId?: string;
  onSuccess?: (investmentId?: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(investmentId);
  const URL: SlashStringType = isEdit
    ? `/admin/investment/update/${investmentId}`
    : '/admin/investment/create';

  const { mutate, isPending } = usePostRequest<
    SaveResponse,
    CreateInvestmentBody | UpdateInvestmentBody
  >({
    URL,
    isPut: isEdit,
    mutationKey: ['save-admin-investment', investmentId ?? 'new'],
    successText: isEdit
      ? 'Investment updated successfully'
      : 'Investment created successfully',
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-investments'] });
      queryClient.invalidateQueries({ queryKey: ['admin-investment-detail'] });
      queryClient.invalidateQueries({ queryKey: ['admin-investment-stats'] });
      onSuccess?.(response.data?.data?.id);
    },
  });

  return {
    saveInvestment: mutate,
    isSavingInvestment: isPending,
    isEdit,
  };
}
