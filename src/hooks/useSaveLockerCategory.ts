import { useQueryClient } from '@tanstack/react-query';

import type {
  SavingCategoryType,
  SavingsCategory,
} from '@/types/LockerTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

/**
 * Create (POST) or update (PUT) a savings category. Pass `categoryId` to edit
 * an existing one; omit it to create. Used by the form sheet and by row-level
 * reactivation (update with `is_active: true`).
 */
export type SaveCategoryBody = {
  name?: string;
  type?: SavingCategoryType;
  description?: string;
  icon_url?: string;
  image_url?: string;
  sort_order?: number;
  is_active?: boolean;
};

type SaveCategoryResponse = {
  success: boolean;
  data: {
    message: string;
    category: SavingsCategory;
  };
};

export default function useSaveLockerCategory({
  categoryId,
  onSuccess,
}: {
  categoryId?: string;
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(categoryId);

  const URL: SlashStringType = isEdit
    ? `/admin/locker/category/${categoryId}`
    : '/admin/locker/category';

  const { mutate, isPending } = usePostRequest<
    SaveCategoryResponse,
    SaveCategoryBody
  >({
    URL,
    isPut: isEdit,
    mutationKey: ['save-locker-category', categoryId ?? 'new'],
    successText: isEdit
      ? 'Category updated successfully'
      : 'Category created successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locker-categories'] });
      onSuccess?.();
    },
  });

  return { saveCategory: mutate, isSavingCategory: isPending, isEdit };
}
