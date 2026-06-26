import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { MailPlus, ShieldCheck, Timer, UserMinus, Users } from 'lucide-react';
import { useForm } from 'react-hook-form';

import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { AdminInvitation, AdminUser } from '@/types/AdminAccessTypes';
import BaseDataTable from '@/components/shared/BaseDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { StatCard } from '@/components/shared/StatCard';
import { TableSearch } from '@/components/shared/TableSearch';
import { LoadingIconSmall } from '@/components/shared/LoadingIconLarge';
import {
  useAdminInvitations,
  useAdminUsers,
  useInviteAdmin,
  useRemoveAdminAccess,
  useResendAdminInvitation,
  useRevokeAdminInvitation,
} from '@/hooks/useAdminAccess';
import { formatDateToReadableShort } from '@/services/TimeServices';

export const Route = createFileRoute('/_admin/settings/access')({
  component: AdminAccessPage,
});

type InviteForm = {
  email: string;
};

const ITEMS_PER_PAGE = 10;

function displayName(user: Pick<AdminUser, 'first_name' | 'last_name' | 'email'>) {
  const name = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  return name || user.email;
}

function statusBadge(status: string) {
  if (status === 'active' || status === 'pending') {
    return (
      <Badge variant="success" className="capitalize">
        {status}
      </Badge>
    );
  }

  if (status === 'revoked' || status === 'expired') {
    return (
      <Badge variant="destructive" className="capitalize">
        {status}
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className="capitalize">
      {status.replace('_', ' ')}
    </Badge>
  );
}

function AdminAccessPage() {
  const [adminPage, setAdminPage] = useState(1);
  const [invitationPage, setInvitationPage] = useState(1);
  const [adminSearch, setAdminSearch] = useState('');
  const [invitationSearch, setInvitationSearch] = useState('');
  const [inviteOpen, setInviteOpen] = useState(false);

  const { admins, stats, meta: adminMeta, isAdminsLoading } = useAdminUsers({
    page: adminPage,
    limit: ITEMS_PER_PAGE,
    search_term: adminSearch || undefined,
  });

  const { invitations, meta: invitationMeta, isInvitationsLoading } = useAdminInvitations({
    page: invitationPage,
    limit: ITEMS_PER_PAGE,
    search_term: invitationSearch || undefined,
  });

  const inviteAdmin = useInviteAdmin();
  const resendInvitation = useResendAdminInvitation();
  const revokeInvitation = useRevokeAdminInvitation();
  const removeAdmin = useRemoveAdminAccess();

  const adminColumns = useMemo<Array<ExtendedColumnDef<AdminUser>>>(
    () => [
      {
        accessorKey: 'email',
        header: 'Admin',
        meta: { className: 'max-w-[24vw]' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {displayName(row.original)}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'coffer_id',
        header: 'Coffer ID',
        cell: ({ row }) => (
          <span className="text-muted-foreground">{row.original.coffer_id}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => statusBadge(row.original.status),
      },
      {
        accessorKey: 'created_at',
        header: 'Added',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateToReadableShort(row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Last Active',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateToReadableShort(row.original.updated_at)}
          </span>
        ),
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        meta: { className: 'w-[150px]' },
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-destructive hover:text-destructive"
            disabled={removeAdmin.isPending}
            onClick={() => {
              const confirmed = window.confirm(`Remove admin access for ${row.original.email}?`);
              if (confirmed) removeAdmin.mutate(row.original.id);
            }}
          >
            <UserMinus className="h-4 w-4" />
            Remove
          </Button>
        ),
      },
    ],
    [removeAdmin],
  );

  const invitationColumns = useMemo<Array<ExtendedColumnDef<AdminInvitation>>>(
    () => [
      {
        accessorKey: 'email',
        header: 'Invited Email',
        cell: ({ row }) => (
          <span className="font-medium text-foreground">{row.original.email}</span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => statusBadge(row.original.status),
      },
      {
        accessorKey: 'invited_by',
        header: 'Invited By',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {displayName(row.original.invited_by)}
          </span>
        ),
      },
      {
        accessorKey: 'expires_at',
        header: 'Expires',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateToReadableShort(row.original.expires_at)}
          </span>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Sent',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDateToReadableShort(row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: 'actions',
        header: 'Actions',
        meta: { className: 'w-[180px]' },
        cell: ({ row }) => {
          const isPending = row.original.status === 'pending';

          return (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={!isPending || resendInvitation.isPending}
                onClick={() => resendInvitation.mutate(row.original.id)}
              >
                Resend
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                disabled={!isPending || revokeInvitation.isPending}
                onClick={() => {
                  const confirmed = window.confirm(`Revoke invitation for ${row.original.email}?`);
                  if (confirmed) revokeInvitation.mutate(row.original.id);
                }}
              >
                Revoke
              </Button>
            </div>
          );
        },
      },
    ],
    [resendInvitation, revokeInvitation],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InviteForm>();

  const submitInvitation = (data: InviteForm) => {
    inviteAdmin.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          reset();
          setInviteOpen(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Admin Access</h1>
          <p className="mt-1 text-muted-foreground">
            Manage Coffer admin users and invitation links.
          </p>
        </div>

        <Sheet open={inviteOpen} onOpenChange={setInviteOpen}>
          <SheetTrigger asChild>
            <Button className="gap-2">
              <MailPlus className="h-4 w-4" />
              Invite admin
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-xl p-0">
            <div className="h-1.5 w-full bg-primary" />
            <SheetHeader className="border-b border-border">
              <SheetTitle>Invite admin</SheetTitle>
              <SheetDescription>
                Send a secure invitation link to a new admin email.
              </SheetDescription>
            </SheetHeader>
            <form onSubmit={handleSubmit(submitInvitation)} className="flex flex-1 flex-col">
              <div className="flex-1 space-y-2 overflow-y-auto px-6 py-5">
                <Label htmlFor="admin-email">Email</Label>
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="name@company.com"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Enter a valid email',
                    },
                  })}
                />
                {errors.email?.message && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  Existing Coffer users cannot be invited as admins.
                </p>
              </div>
              <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setInviteOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={inviteAdmin.isPending}>
                  {inviteAdmin.isPending ? <LoadingIconSmall /> : 'Send invite'}
                </Button>
              </SheetFooter>
            </form>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <StatCard
          title="Active admins"
          value={String(stats.active_admins)}
          subValue="Users with dashboard access"
          icon={ShieldCheck}
        />
        <StatCard
          title="Pending invitations"
          value={String(stats.pending_invitations)}
          subValue="Awaiting acceptance"
          icon={Timer}
          accentClassName="bg-amber-500"
        />
      </div>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Admins</h2>
            <p className="text-sm text-muted-foreground">People who can access this dashboard.</p>
          </div>
          <TableSearch
            placeholder="Search admins..."
            searchTerm={adminSearch}
            onSearchChange={(value) => {
              setAdminPage(1);
              setAdminSearch(value);
            }}
          />
        </div>
        <BaseDataTable
          columns={adminColumns}
          data={admins}
          meta={adminMeta ?? undefined}
          setPage={setAdminPage}
          isLoading={isAdminsLoading}
          showOnMobile
        />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Invitations</h2>
            <p className="text-sm text-muted-foreground">Pending, accepted, revoked, and expired links.</p>
          </div>
          <TableSearch
            placeholder="Search invitations..."
            searchTerm={invitationSearch}
            onSearchChange={(value) => {
              setInvitationPage(1);
              setInvitationSearch(value);
            }}
          />
        </div>
        <BaseDataTable
          columns={invitationColumns}
          data={invitations}
          meta={invitationMeta ?? undefined}
          setPage={setInvitationPage}
          isLoading={isInvitationsLoading}
          showOnMobile
        />
      </section>
    </div>
  );
}
