import { useQueryClient } from '@tanstack/react-query';

import type { SavingsCategory } from '@/types/LockerTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

type DeactivateCategoryResponse = {
  success: boolean;
  data: {
    message: string;
    category: SavingsCategory;
  };
};

/**
 * Soft delete — hits `DELETE /admin/locker/category/:id`, which deactivates
 * (sets `is_active: false`) rather than hard-deleting, since categories are
 * FK-referenced by locks and cabals.
 */
export default function useDeactivateLockerCategory({
  categoryId,
  onSuccess,
}: {
  categoryId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const URL: SlashStringType = `/admin/locker/category/${categoryId}`;

  const { mutate, isPending } = usePostRequest<DeactivateCategoryResponse, void>({
    URL,
    isDelete: true,
    mutationKey: ['deactivate-locker-category', categoryId],
    successText: 'Category deactivated successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locker-categories'] });
      onSuccess?.();
    },
  });

  return { deactivateCategory: mutate, isDeactivating: isPending };
}
