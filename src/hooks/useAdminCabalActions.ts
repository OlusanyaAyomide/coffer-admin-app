import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { CabalMember } from '@/types/LockerTypes';
import type { QueryError } from '@/types/ResponseTypes';
import { normalizeApiErrors } from '@/services/errorServices';
import API from '@/services/api';
import usePostRequest from '@/hooks/usePostRequests';

type FeatureBody = { is_featured: boolean; importance?: number };

function useInvalidateCabal() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ['admin-cabals'] });
    queryClient.invalidateQueries({ queryKey: ['admin-cabal-detail'] });
  };
}

/** Feature/unfeature and close actions for a single cabal (detail page). */
export default function useAdminCabalActions({
  cabalId,
  onSuccess,
}: {
  cabalId: string;
  onSuccess?: () => void;
}) {
  const invalidate = useInvalidateCabal();

  const { mutate: setFeatured, isPending: isFeaturing } = usePostRequest<
    unknown,
    FeatureBody
  >({
    URL: `/admin/locker/cabal/${cabalId}/feature`,
    isPatch: true,
    mutationKey: ['cabal-feature', cabalId],
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });

  const { mutate: closeCabal, isPending: isClosing } = usePostRequest<
    unknown,
    Record<string, never>
  >({
    URL: `/admin/locker/cabal/${cabalId}/close`,
    isPatch: true,
    mutationKey: ['cabal-close', cabalId],
    successText: 'Cabal closed successfully',
    onSuccess: () => {
      invalidate();
      onSuccess?.();
    },
  });

  return { setFeatured, isFeaturing, closeCabal, isClosing };
}

type MemberStatusVars = {
  memberId: string;
  status: 'active' | 'suspended';
};

type MemberStatusResponse = {
  success: boolean;
  data: { message: string; member: CabalMember };
};

/**
 * Suspend / reinstate a cabal member. URL carries the member id, so this is a
 * raw mutation rather than a fixed-URL post hook.
 */
export function useSetCabalMemberStatus({
  cabalId,
  onSuccess,
}: {
  cabalId: string;
  onSuccess?: () => void;
}) {
  const invalidate = useInvalidateCabal();

  const { mutate, isPending } = useMutation<
    MemberStatusResponse,
    QueryError,
    MemberStatusVars
  >({
    mutationKey: ['cabal-member-status', cabalId],
    mutationFn: async ({ memberId, status }) => {
      const response = await API.patch(
        `/admin/locker/cabal/${cabalId}/member/${memberId}/status`,
        { status },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(data.data.message);
      invalidate();
      onSuccess?.();
    },
    onError: (err) => {
      normalizeApiErrors(err).forEach((item) => toast.error(item));
    },
  });

  return { setMemberStatus: mutate, isUpdatingMember: isPending };
}

type MemberRoleVars = {
  memberId: string;
  role: 'admin' | 'member';
};

/** Promote/demote a cabal member's role. */
export function useSetCabalMemberRole({
  cabalId,
  onSuccess,
}: {
  cabalId: string;
  onSuccess?: () => void;
}) {
  const invalidate = useInvalidateCabal();

  const { mutate, isPending } = useMutation<
    MemberStatusResponse,
    QueryError,
    MemberRoleVars
  >({
    mutationKey: ['cabal-member-role', cabalId],
    mutationFn: async ({ memberId, role }) => {
      const response = await API.patch(
        `/admin/locker/cabal/${cabalId}/member/${memberId}/role`,
        { role },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.dismiss();
      toast.success(data.data.message);
      invalidate();
      onSuccess?.();
    },
    onError: (err) => {
      normalizeApiErrors(err).forEach((item) => toast.error(item));
    },
  });

  return { setMemberRole: mutate, isUpdatingRole: isPending };
}
