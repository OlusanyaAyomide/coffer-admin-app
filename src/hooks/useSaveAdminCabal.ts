import { useQueryClient } from '@tanstack/react-query';

import type {
  CabalSummary,
  ContributionFrequency,
  EntryCurrency,
} from '@/types/LockerTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

export type SaveAdminCabalBody = {
  name?: string;
  description?: string;
  image_url?: string;
  icon_url?: string;
  goal_name?: string;
  target_amount?: number;
  currency?: EntryCurrency;
  contribution_amount?: number;
  contribution_frequency?: ContributionFrequency;
  max_members?: number;
  start_date?: string;
  end_date?: string;
  category_id?: string;
  contribution_day?: number;
  is_featured?: boolean;
  importance?: number;
  promotional_bonus?: number;
};

type SaveAdminCabalResponse = {
  success: boolean;
  data: {
    message: string;
    cabal: CabalSummary;
  };
};

export default function useSaveAdminCabal({
  cabalId,
  onSuccess,
}: {
  cabalId?: string;
  onSuccess?: (cabalId?: string) => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(cabalId);
  const URL: SlashStringType = isEdit
    ? `/admin/locker/cabal/${cabalId}`
    : '/admin/locker/cabal';

  const { mutate, isPending } = usePostRequest<
    SaveAdminCabalResponse,
    SaveAdminCabalBody
  >({
    URL,
    isPatch: isEdit,
    mutationKey: ['save-admin-cabal', cabalId ?? 'new'],
    successText: isEdit ? 'Cabal updated successfully' : 'Cabal created successfully',
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['admin-cabals'] });
      queryClient.invalidateQueries({ queryKey: ['admin-cabal-detail'] });
      onSuccess?.(response.data?.cabal?.id);
    },
  });

  return {
    saveCabal: mutate,
    isSavingCabal: isPending,
    isEdit,
  };
}
