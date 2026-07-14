import type {
  AudienceFilter,
  AudiencePreviewUser,
  CampaignChannel,
} from '@/types/CampaignTypes';
import usePostRequest from '@/hooks/usePostRequests';

type PreviewBody = {
  audience: AudienceFilter;
  channel: CampaignChannel;
};

type PreviewResponse = {
  success: boolean;
  data: {
    matched_count: number;
    sample_users: Array<AudiencePreviewUser>;
  };
};

/**
 * On-demand audience preview for the campaign builder. `mutate` runs the
 * preview; `data` holds the last result (matched_count + up to 5 sample users).
 */
export default function usePreviewAudience() {
  const { mutate, data, isPending, reset } = usePostRequest<
    PreviewResponse,
    PreviewBody
  >({
    URL: '/admin/campaigns/preview-audience',
    mutationKey: ['preview-audience'],
    showErrorToast: true,
  });

  return {
    previewAudience: mutate,
    preview: data?.data ?? null,
    isPreviewing: isPending,
    resetPreview: reset,
  };
}
