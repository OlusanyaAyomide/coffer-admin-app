import { useQueryClient } from '@tanstack/react-query';

import type {
  AdminInvestmentCategory,
  AdminInvestmentSubCategory,
  ListResponse,
} from '@/types/InvestmentTypes';
import type { QueryError } from '@/types/ResponseTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import useGetRequest from '@/hooks/useGetRequests';
import usePostRequest from '@/hooks/usePostRequests';

export function useInvestmentCategories({
  page = 1,
  limit = 100,
  is_active,
  enabled = true,
}: {
  page?: number;
  limit?: number;
  is_active?: boolean;
  enabled?: boolean;
} = {}) {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (is_active !== undefined) params.is_active = is_active;

  const { data, isError, isLoading, refetch } = useGetRequest<
    ListResponse<AdminInvestmentCategory>,
    QueryError
  >({
    URL: '/admin/investment/categories',
    queryKey: ['admin-investment-categories', String(page), String(is_active ?? '')],
    params,
    enabled,
  });

  return {
    categories: data?.data?.data ?? [],
    meta: data?.meta ?? null,
    isCategoriesLoading: isLoading,
    isCategoriesError: isError,
    refetchCategories: refetch,
  };
}

export function useInvestmentSubCategories({
  categoryId,
  is_active,
  enabled = true,
}: {
  categoryId?: string;
  is_active?: boolean;
  enabled?: boolean;
}) {
  const params: Record<string, string | number | boolean> = { page: 1, limit: 100 };
  if (is_active !== undefined) params.is_active = is_active;

  const { data, isError, isLoading, refetch } = useGetRequest<
    ListResponse<AdminInvestmentSubCategory>,
    QueryError
  >({
    URL: `/admin/investment/category/${categoryId ?? ''}/sub-categories`,
    queryKey: ['admin-investment-sub-categories', categoryId ?? '', String(is_active ?? '')],
    params,
    enabled: Boolean(categoryId) && enabled,
  });

  return {
    subCategories: data?.data?.data ?? [],
    isSubCategoriesLoading: isLoading,
    isSubCategoriesError: isError,
    refetchSubCategories: refetch,
  };
}

export type SaveCategoryBody = {
  name?: string;
  description?: string;
  icon_id?: string;
  order?: number;
  is_active?: boolean;
};

export function useSaveInvestmentCategory({
  categoryId,
  onSuccess,
}: {
  categoryId?: string;
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(categoryId);
  const URL: SlashStringType = isEdit
    ? `/admin/investment/category/${categoryId}`
    : '/admin/investment/category';

  const { mutate, isPending } = usePostRequest<
    { data: AdminInvestmentCategory },
    SaveCategoryBody
  >({
    URL,
    isPut: isEdit,
    mutationKey: ['save-investment-category', categoryId ?? 'new'],
    successText: isEdit ? 'Category updated' : 'Category created',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investment-categories'] });
      onSuccess?.();
    },
  });

  return { saveCategory: mutate, isSavingCategory: isPending, isEdit };
}

export type SaveSubCategoryBody = {
  category_id?: string;
  name?: string;
  description?: string;
  icon_id?: string;
  is_active?: boolean;
};

export function useSaveInvestmentSubCategory({
  subCategoryId,
  onSuccess,
}: {
  subCategoryId?: string;
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(subCategoryId);
  const URL: SlashStringType = isEdit
    ? `/admin/investment/sub-category/${subCategoryId}`
    : '/admin/investment/sub-category';

  const { mutate, isPending } = usePostRequest<
    { data: AdminInvestmentSubCategory },
    SaveSubCategoryBody
  >({
    URL,
    isPut: isEdit,
    mutationKey: ['save-investment-sub-category', subCategoryId ?? 'new'],
    successText: isEdit ? 'Sub-category updated' : 'Sub-category created',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-investment-categories'] });
      queryClient.invalidateQueries({ queryKey: ['admin-investment-sub-categories'] });
      onSuccess?.();
    },
  });

  return { saveSubCategory: mutate, isSavingSubCategory: isPending, isEdit };
}
