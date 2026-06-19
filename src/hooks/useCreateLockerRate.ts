import { useQueryClient } from '@tanstack/react-query';

import type { LockerType, SavingsRate } from '@/types/LockerTypes';
import usePostRequest from '@/hooks/usePostRequests';

type CreateRateBody = {
  type: LockerType;
  rate: number;
  note?: string;
};

type CreateRateResponse = {
  success: boolean;
  data: {
    message: string;
    rate: SavingsRate;
  };
};

export default function useCreateLockerRate(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = usePostRequest<CreateRateResponse, CreateRateBody>({
    URL: '/admin/locker/rate',
    mutationKey: ['create-locker-rate'],
    successText: 'Savings rate updated successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locker-rates'] });
      queryClient.invalidateQueries({ queryKey: ['locker-rate-history'] });
      onSuccess?.();
    },
  });

  return { createRate: mutate, isCreatingRate: isPending };
}
