import type { PaginationType } from '@/types/ResponseTypes';

export type AdminUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  coffer_id: string;
  status: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};

export type AdminInvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired';

export type AdminInvitationPerson = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
};

export type AdminInvitation = {
  id: string;
  email: string;
  status: AdminInvitationStatus;
  expires_at: string;
  accepted_at: string | null;
  revoked_at: string | null;
  created_at: string;
  updated_at: string;
  invited_by: AdminInvitationPerson;
  accepted_user: AdminInvitationPerson | null;
};

export type AdminAccessStats = {
  active_admins: number;
  pending_invitations: number;
};

export type AdminListResponse = {
  success: boolean;
  data: {
    admins: AdminUser[];
    stats: AdminAccessStats;
  };
  meta: PaginationType;
};

export type AdminInvitationListResponse = {
  success: boolean;
  data: {
    invitations: AdminInvitation[];
  };
  meta: PaginationType;
};

export type AdminInvitationPreviewResponse = {
  success: boolean;
  data: {
    email: string;
    expires_at: string;
    status: AdminInvitationStatus;
  };
};

export type AdminInvitePayload = {
  email: string;
};

export type AcceptAdminInvitationPayload = {
  invite_token: string;
  password: string;
  password_confirmation: string;
};
