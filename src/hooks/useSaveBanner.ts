import { useQueryClient } from '@tanstack/react-query';

import type { Banner, BannerLinkType, BannerStatus } from '@/types/BannerTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

/**
 * Create (POST) or update (PUT) a banner. Pass `bannerId` to edit an existing
 * one; omit it to create.
 */
export type SaveBannerBody = {
  title?: string;
  description?: string;
  image_url?: string;
  link_type?: BannerLinkType;
  link_target?: string;
  sort_order?: number;
  status?: BannerStatus;
  start_at?: string;
  end_at?: string;
};

type SaveBannerResponse = {
  success: boolean;
  data: {
    message: string;
    banner: Banner;
  };
};

export default function useSaveBanner({
  bannerId,
  onSuccess,
}: {
  bannerId?: string;
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(bannerId);

  const URL: SlashStringType = isEdit
    ? `/admin/banners/${bannerId}`
    : '/admin/banners';

  const { mutate, isPending } = usePostRequest<SaveBannerResponse, SaveBannerBody>({
    URL,
    isPut: isEdit,
    mutationKey: ['save-banner', bannerId ?? 'new'],
    successText: isEdit
      ? 'Banner updated successfully'
      : 'Banner created successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['banners'] });
      onSuccess?.();
    },
  });

  return { saveBanner: mutate, isSavingBanner: isPending, isEdit };
}
