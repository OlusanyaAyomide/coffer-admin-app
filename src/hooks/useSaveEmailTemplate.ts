import { useQueryClient } from '@tanstack/react-query';

import type { EmailTemplate } from '@/types/EmailTemplateTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import usePostRequest from '@/hooks/usePostRequests';

export type SaveEmailTemplateBody = {
  name?: string;
  subject?: string;
  html_body?: string;
};

type SaveTemplateResponse = {
  success: boolean;
  data: { message: string; template: EmailTemplate };
};

export default function useSaveEmailTemplate({
  templateId,
  onSuccess,
}: {
  templateId?: string;
  onSuccess?: () => void;
} = {}) {
  const queryClient = useQueryClient();
  const isEdit = Boolean(templateId);

  const URL: SlashStringType = isEdit
    ? `/admin/email-templates/${templateId}`
    : '/admin/email-templates';

  const { mutate, isPending } = usePostRequest<
    SaveTemplateResponse,
    SaveEmailTemplateBody
  >({
    URL,
    isPut: isEdit,
    mutationKey: ['save-email-template', templateId ?? 'new'],
    successText: isEdit ? 'Template updated' : 'Template created',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
      onSuccess?.();
    },
  });

  return { saveTemplate: mutate, isSavingTemplate: isPending, isEdit };
}
