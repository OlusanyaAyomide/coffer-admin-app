import { useQueryClient } from '@tanstack/react-query';

import type {
  AudienceFilter,
  Campaign,
  CampaignChannel,
  CampaignSchedule,
} from '@/types/CampaignTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

/**
 * Create (POST) or update (PUT) a campaign. Pass `campaignId` to edit an
 * existing one; omit it to create. `channel` is immutable after create, so it
 * is only sent on create.
 */
export type SaveCampaignBody = {
  name?: string;
  description?: string;
  channel?: CampaignChannel;
  template_id?: string;
  subject_override?: string;
  push_title?: string;
  push_body?: string;
  audience?: AudienceFilter;
  schedule_kind?: CampaignSchedule;
  scheduled_at?: string;
  cron_expression?: string;
};

type SaveCampaignResponse = {
  success: boolean;
  data: { message: string; campaign: Campaign };
};

export default function useSaveCampaign({
  campaignId,
  onSuccess,
}: {
  campaignId?: string;
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(campaignId);

  const URL: SlashStringType = isEdit
    ? `/admin/campaigns/${campaignId}`
    : '/admin/campaigns';

  const { mutate, isPending } = usePostRequest<
    SaveCampaignResponse,
    SaveCampaignBody
  >({
    URL,
    isPut: isEdit,
    mutationKey: ['save-campaign', campaignId ?? 'new'],
    successText: isEdit
      ? 'Campaign updated successfully'
      : 'Campaign created successfully',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      onSuccess?.();
    },
  });

  return { saveCampaign: mutate, isSavingCampaign: isPending, isEdit };
}
