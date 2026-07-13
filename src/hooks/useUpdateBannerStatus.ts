import { useQueryClient } from '@tanstack/react-query';

import type { Banner, BannerStatus } from '@/types/BannerTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

type UpdateStatusBody = { status: BannerStatus };

type UpdateStatusResponse = {
  success: boolean;
  data: {
    message: string;
    banner: Banner;
  };
};

export default function useUpdateBannerStatus({
  bannerId,
  onSuccess,
}: {
  bannerId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = usePostRequest<
    UpdateStatusResponse,
    UpdateStatusBody
  >({
    URL: `/admin/banners/${bannerId}/status` as SlashStringType,
    isPatch: true,
    mutationKey: ['update-banner-status', bannerId],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      onSuccess?.();
    },
  });

  return { updateBannerStatus: mutate, isUpdatingStatus: isPending };
}
