import type { CampaignRun } from '@/types/CampaignTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import useGetRequest from '@/hooks/useGetRequests';

type RunsResponse = {
  success: boolean;
  data: { runs: Array<CampaignRun> };
  meta: PaginationType;
};

export default function useCampaignRuns({
  campaignId,
  page = 1,
  limit = 20,
  enabled = true,
}: {
  campaignId: string;
  page?: number;
  limit?: number;
  enabled?: boolean;
}) {
  const { data, isError, isLoading, refetch } = useGetRequest<
    RunsResponse,
    QueryError
  >({
    URL: `/admin/campaigns/${campaignId}/runs` as SlashStringType,
    queryKey: ['campaign-runs', campaignId, String(page), String(limit)],
    params: { page, limit },
    enabled,
  });

  return {
    runs: data?.data?.runs ?? [],
    meta: data?.meta ?? null,
    isRunsLoading: isLoading,
    isRunsError: isError,
    refetchRuns: refetch,
  };
}
