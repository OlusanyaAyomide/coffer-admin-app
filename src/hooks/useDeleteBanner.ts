import { useQueryClient } from '@tanstack/react-query';

import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

type DeleteBannerResponse = {
  success: boolean;
  data: { message: string };
};

export default function useDeleteBanner({
  bannerId,
  onSuccess,
}: {
  bannerId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = usePostRequest<DeleteBannerResponse, undefined>({
    URL: `/admin/banners/${bannerId}` as SlashStringType,
    isDelete: true,
    mutationKey: ['delete-banner', bannerId],
    successText: 'Banner deleted',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      onSuccess?.();
    },
  });

  return { deleteBanner: mutate, isDeletingBanner: isPending };
}
