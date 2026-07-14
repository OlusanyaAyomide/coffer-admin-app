import type { EmailTemplate } from '@/types/EmailTemplateTypes';
import type { PaginationType, QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';

type TemplatesResponse = {
  success: boolean;
  data: { templates: Array<EmailTemplate> };
  meta: PaginationType;
};

const ITEMS_PER_PAGE = 20;

export default function useEmailTemplates({
  page = 1,
  limit = ITEMS_PER_PAGE,
  search,
  enabled = true,
}: {
  page?: number;
  limit?: number;
  search?: string;
  enabled?: boolean;
} = {}) {
  const params: Record<string, string | number | boolean> = { page, limit };
  if (search) params.search = search;

  const { data, isError, isLoading, refetch } = useGetRequest<
    TemplatesResponse,
    QueryError
  >({
    URL: '/admin/email-templates',
    queryKey: ['email-templates', String(page), String(limit), search ?? ''],
    params,
    enabled,
  });

  return {
    templates: data?.data?.templates ?? [],
    meta: data?.meta ?? null,
    isTemplatesLoading: isLoading,
    isTemplatesError: isError,
    refetchTemplates: refetch,
  };
}
