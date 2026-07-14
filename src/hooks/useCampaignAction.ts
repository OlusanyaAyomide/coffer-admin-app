import { useQueryClient } from '@tanstack/react-query';

import type { Campaign, CampaignRun } from '@/types/CampaignTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

export type CampaignAction = 'schedule' | 'pause' | 'send-now';

type ActionResponse = {
  success: boolean;
  data: { message: string; campaign?: Campaign; run?: CampaignRun };
};

const SUCCESS_TEXT: Record<CampaignAction, string> = {
  schedule: 'Campaign scheduled',
  pause: 'Campaign paused',
  'send-now': 'Campaign is being sent',
};

/**
 * POSTs a lifecycle action (schedule / pause / send-now) for a campaign and
 * invalidates the list so status + run counters refresh.
 */
export default function useCampaignAction({
  campaignId,
  action,
  onSuccess,
}: {
  campaignId: string;
  action: CampaignAction;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = usePostRequest<ActionResponse, undefined>({
    URL: `/admin/campaigns/${campaignId}/${action}` as SlashStringType,
    mutationKey: ['campaign-action', action, campaignId],
    successText: SUCCESS_TEXT[action],
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['campaign-runs', campaignId] });
      onSuccess?.();
    },
  });

  return { runAction: mutate, isRunningAction: isPending };
}
