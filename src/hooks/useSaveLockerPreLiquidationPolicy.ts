import { useQueryClient } from '@tanstack/react-query';

import type { LockerPreLiquidationPolicy, LockerType } from '@/types/LockerTypes';
import usePostRequest from '@/hooks/usePostRequests';

export type SavePreLiquidationPolicyBody = {
  minimum_active_months: number;
  note?: string;
  ranges: Array<{
    start_percentage: number;
    end_percentage: number;
    penalty_rate: number;
  }>;
};

type SavePolicyResponse = {
  success: boolean;
  data: {
    message: string;
    policy: LockerPreLiquidationPolicy;
  };
};

export default function useSaveLockerPreLiquidationPolicy({
  type,
  onSuccess,
}: {
  type: LockerType;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = usePostRequest<
    SavePolicyResponse,
    SavePreLiquidationPolicyBody
  >({
    URL: `/admin/locker/pre-liquidation-penalty/${type}`,
    isPut: true,
    mutationKey: ['save-locker-pre-liquidation-policy', type],
    successText: 'Pre-liquidation penalty updated successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['locker-pre-liquidation-policy', type],
      });
      onSuccess?.();
    },
  });

  return { savePolicy: mutate, isSavingPolicy: isPending };
}
