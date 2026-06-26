import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type {
  AdminInvitePayload,
  AdminInvitationListResponse,
  AdminListResponse,
} from '@/types/AdminAccessTypes';
import type { QueryError } from '@/types/ResponseTypes';
import useGetRequest from '@/hooks/useGetRequests';
import usePostRequest from '@/hooks/usePostRequests';
import API from '@/services/api';
import { normalizeApiErrors } from '@/services/errorServices';
import CloseToast from '@/components/shared/CloseToast';

const ADMIN_QUERY_KEY = 'admin-access-admins';
const INVITATION_QUERY_KEY = 'admin-access-invitations';

export function useAdminUsers(params: {
  page: number;
  search_term?: string;
  limit?: number;
}) {
  const { data, isLoading, isError, refetch } = useGetRequest<AdminListResponse, QueryError>({
    URL: '/admin/user/admins',
    queryKey: [ADMIN_QUERY_KEY, String(params.page)],
    params,
  });

  return {
    admins: data?.data?.admins ?? [],
    stats: data?.data?.stats ?? { active_admins: 0, pending_invitations: 0 },
    meta: data?.meta ?? null,
    isAdminsLoading: isLoading,
    isAdminsError: isError,
    refetchAdmins: refetch,
  };
}

export function useAdminInvitations(params: {
  page: number;
  search_term?: string;
  status?: string;
  limit?: number;
}) {
  const { data, isLoading, isError, refetch } = useGetRequest<AdminInvitationListResponse, QueryError>({
    URL: '/admin/user/invitations',
    queryKey: [INVITATION_QUERY_KEY, String(params.page)],
    params,
  });

  return {
    invitations: data?.data?.invitations ?? [],
    meta: data?.meta ?? null,
    isInvitationsLoading: isLoading,
    isInvitationsError: isError,
    refetchInvitations: refetch,
  };
}

export function useInviteAdmin() {
  const queryClient = useQueryClient();

  return usePostRequest<unknown, AdminInvitePayload>({
    URL: '/admin/user/invitations',
    successText: 'Admin invitation sent',
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVITATION_QUERY_KEY] });
    },
  });
}

export function useResendAdminInvitation() {
  const queryClient = useQueryClient();

  return useMutation<unknown, QueryError, string>({
    mutationFn: async (id) => {
      const response = await API.post(`/admin/user/invitations/${id}/resend`, {});
      return response.data;
    },
    onSuccess: () => {
      toast.success('Invitation resent', { action: <CloseToast /> });
      queryClient.invalidateQueries({ queryKey: [INVITATION_QUERY_KEY] });
    },
    onError: (err) => {
      normalizeApiErrors(err).forEach((item) => {
        toast.error(item, { action: <CloseToast /> });
      });
    },
  });
}

export function useRevokeAdminInvitation() {
  const queryClient = useQueryClient();

  return useMutation<unknown, QueryError, string>({
    mutationFn: async (id) => {
      const response = await API.post(`/admin/user/invitations/${id}/revoke`, {});
      return response.data;
    },
    onSuccess: () => {
      toast.success('Invitation revoked', { action: <CloseToast /> });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVITATION_QUERY_KEY] });
    },
    onError: (err) => {
      normalizeApiErrors(err).forEach((item) => {
        toast.error(item, { action: <CloseToast /> });
      });
    },
  });
}

export function useRemoveAdminAccess() {
  const queryClient = useQueryClient();

  return useMutation<unknown, QueryError, string>({
    mutationFn: async (userId) => {
      const response = await API.patch(`/admin/user/${userId}/role`, { role: 'user' });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Admin access removed', { action: <CloseToast /> });
      queryClient.invalidateQueries({ queryKey: [ADMIN_QUERY_KEY] });
    },
    onError: (err) => {
      normalizeApiErrors(err).forEach((item) => {
        toast.error(item, { action: <CloseToast /> });
      });
    },
  });
}

export const adminAccessQueryKeys = {
  admins: ADMIN_QUERY_KEY,
  invitations: INVITATION_QUERY_KEY,
};
