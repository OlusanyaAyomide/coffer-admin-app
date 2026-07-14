import type {
  Campaign,
  CampaignChannel,
  CampaignStatus,
} from '@/types/CampaignTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type CampaignsParams = {
  page?: number;
  limit?: number;
  search?: string;
  channel?: CampaignChannel;
  status?: CampaignStatus;
};

type CampaignsResponse = {
  success: boolean;
  data: { campaigns: Array<Campaign> };
  meta: PaginationType;
};

const ITEMS_PER_PAGE = 20;

export default function useCampaigns({
  page = 1,
  limit = ITEMS_PER_PAGE,
  search,
  channel,
  status,
}: CampaignsParams = {}) {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (search) params.search = search;
  if (channel) params.channel = channel;
  if (status) params.status = status;

  const { data, isError, isLoading, refetch } = useGetRequest<
    CampaignsResponse,
    QueryError
  >({
    URL: '/admin/campaigns',
    queryKey: [
      'campaigns',
      String(page),
      String(limit),
      search ?? '',
      channel ?? '',
      status ?? '',
    ],
    params,
  });

  return {
    campaigns: data?.data?.campaigns ?? [],
    meta: data?.meta ?? null,
    isCampaignsLoading: isLoading,
    isCampaignsError: isError,
    refetchCampaigns: refetch,
  };
}
