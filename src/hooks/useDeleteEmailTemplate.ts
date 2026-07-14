import { useQueryClient } from '@tanstack/react-query';

import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

type DeleteTemplateResponse = {
  success: boolean;
  data: { message: string };
};

export default function useDeleteEmailTemplate({
  templateId,
  onSuccess,
}: {
  templateId: string;
  onSuccess?: () => void;
}) {
  const queryClient = useQueryClient();

  const { mutate, isPending } = usePostRequest<DeleteTemplateResponse, undefined>({
    URL: `/admin/email-templates/${templateId}` as SlashStringType,
    isDelete: true,
    mutationKey: ['delete-email-template', templateId],
    successText: 'Template deleted',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      onSuccess?.();
    },
  });

  return { deleteTemplate: mutate, isDeletingTemplate: isPending };
}
