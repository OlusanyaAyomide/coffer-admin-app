import { useQueryClient } from '@tanstack/react-query';

import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

type DeleteCampaignResponse = {
  success: boolean;
  data: { message: string };
};

export default function useDeleteCampaign({
  campaignId,
  onSuccess,
}: {
  campaignId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = usePostRequest<DeleteCampaignResponse, undefined>({
    URL: `/admin/campaigns/${campaignId}` as SlashStringType,
    isDelete: true,
    mutationKey: ['delete-campaign', campaignId],
    successText: 'Campaign deleted',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onSuccess?.();
    },
  });

  return { deleteCampaign: mutate, isDeletingCampaign: isPending };
}
