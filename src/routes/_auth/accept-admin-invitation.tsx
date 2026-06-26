import { yupResolver } from '@hookform/resolvers/yup';
import { createFileRoute, useNavigate, useSearch } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { LockKeyhole, Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';

import type {
  AcceptAdminInvitationFormData,
} from '@/validations/AuthValidations';
import type {
  AcceptAdminInvitationPayload,
  AdminInvitationPreviewResponse,
} from '@/types/AdminAccessTypes';
import type { UserAuthApiResponse } from '@/types/AuthTypes';
import type { QueryError } from '@/types/ResponseTypes';
import API from '@/services/api';
import { setAuthCookies } from '@/services/CookiesServices';
import { acceptAdminInvitationSchema } from '@/validations/AuthValidations';
import usePostRequest from '@/hooks/usePostRequests';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import InputField from '@/components/shared/InputField';
import RequiredLabel from '@/components/shared/RequiredLabel';
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge';

export const Route = createFileRoute('/_auth/accept-admin-invitation')({
  component: AcceptAdminInvitationPage,
});

function getErrorMessage(error: unknown) {
  const queryError = error as QueryError | undefined;
  const message = queryError?.response?.data?.message;

  if (Array.isArray(message)) return message.join(', ');
  if (typeof message === 'string') return message;
  return 'This invitation link is invalid or no longer available.';
}

function AcceptAdminInvitationPage() {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as { token?: string };
  const token = search.token ?? '';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AcceptAdminInvitationFormData>({
    resolver: yupResolver(acceptAdminInvitationSchema),
  });

  const preview = useQuery<AdminInvitationPreviewResponse, QueryError>({
    queryKey: ['admin-invitation-preview', token],
    enabled: !!token,
    retry: false,
    queryFn: async () => {
      const response = await API.get(`/auth/admin-invitations/${token}`);
      return response.data;
    },
  });

  const acceptInvite = usePostRequest<UserAuthApiResponse, AcceptAdminInvitationPayload>({
    URL: '/auth/admin-invitations/accept',
    successText: 'Invitation accepted',
    onSuccess: (response) => {
      setAuthCookies(response.data);
      navigate({ to: '/overview' });
    },
  });

  const onSubmit = (data: AcceptAdminInvitationFormData) => {
    acceptInvite.mutate({
      invite_token: token,
      password: data.password,
      password_confirmation: data.password_confirmation,
    });
  };

  if (!token) {
    return (
      <Card className="w-full max-w-[560px] p-8 shadow-xl bg-card">
        <div className="space-y-3 text-center">
          <Badge variant="destructive">Missing token</Badge>
          <h2 className="text-2xl font-semibold text-foreground">Invitation unavailable</h2>
          <p className="text-sm text-muted-foreground">
            Open the invitation link from your email to continue.
          </p>
        </div>
      </Card>
    );
  }

  if (preview.isLoading) {
    return (
      <Card className="w-full max-w-[560px] p-8 shadow-xl bg-card">
        <div className="flex items-center justify-center py-8">
          <LoadingIconSmall />
        </div>
      </Card>
    );
  }

  if (preview.isError) {
    return (
      <Card className="w-full max-w-[560px] p-8 shadow-xl bg-card">
        <div className="space-y-3 text-center">
          <Badge variant="destructive">Invalid invitation</Badge>
          <h2 className="text-2xl font-semibold text-foreground">Invitation unavailable</h2>
          <p className="text-sm text-muted-foreground">
            {getErrorMessage(preview.error)}
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-[600px] p-8 shadow-xl bg-card">
      <div className="mb-8 flex flex-col items-center text-center">
        <div className="mb-4 flex size-12 items-center justify-center rounded-lg bg-muted">
          <LockKeyhole className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-3xl font-bold text-primary">Accept admin invitation</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Set your password to finish creating your Coffer admin account.
        </p>
        <div className="mt-4 flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          <Mail className="h-4 w-4 text-muted-foreground" />
          {preview.data?.data.email}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2">
          <RequiredLabel>Password</RequiredLabel>
          <InputField
            fieldName="password"
            register={register}
            error={errors.password?.message}
            placeHolderText="Enter your password"
            showPlaceholder
            showPasswordToggle
            onPasswordToggle={() => setShowPassword((prev) => !prev)}
            type={showPassword ? 'text' : 'password'}
          />
        </div>

        <div className="space-y-2">
          <RequiredLabel>Confirm Password</RequiredLabel>
          <InputField
            fieldName="password_confirmation"
            register={register}
            error={errors.password_confirmation?.message}
            placeHolderText="Confirm your password"
            showPlaceholder
            showPasswordToggle
            onPasswordToggle={() => setShowConfirmation((prev) => !prev)}
            type={showConfirmation ? 'text' : 'password'}
          />
        </div>

        <Button
          type="submit"
          className="h-11 w-full text-base"
          disabled={acceptInvite.isPending}
        >
          {acceptInvite.isPending ? <LoadingIconSmall /> : 'Accept invitation'}
        </Button>
      </form>
    </Card>
  );
}
