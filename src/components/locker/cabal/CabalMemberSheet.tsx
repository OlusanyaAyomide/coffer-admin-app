import { Link } from '@tanstack/react-router';
import { Ban, ExternalLink, RotateCcw, Shield, ShieldOff } from 'lucide-react';

import type { CabalMember, EntryCurrency } from '@/types/LockerTypes';
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  MEMBER_STATUS_LABELS,
  formatCabalDate,
  formatCabalMoney,
  memberStatusBadgeVariant,
} from '@/lib/cabalFormat';
import {
  useSetCabalMemberRole,
  useSetCabalMemberStatus,
} from '@/hooks/useAdminCabalActions';

type Props = {
  cabalId: string;
  currency: EntryCurrency;
  member: CabalMember | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function initials(name: string) {
  return (
    name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase() || '?'
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function CabalMemberSheet({
  cabalId,
  currency,
  member,
  open,
  onOpenChange,
}: Props) {
  const { setMemberStatus, isUpdatingMember } = useSetCabalMemberStatus({
    cabalId,
    onSuccess: () => onOpenChange(false),
  });
  const { setMemberRole, isUpdatingRole } = useSetCabalMemberRole({
    cabalId,
    onSuccess: () => onOpenChange(false),
  });

  const isSuspended = member?.status === 'suspended';
  const isAdmin = member?.role === 'admin';
  const canModerate =
    member?.status === 'active' || member?.status === 'suspended';
  const canChangeRole = member?.status === 'active';
  const busy = isUpdatingMember || isUpdatingRole;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <div className="h-1.5 w-full shrink-0 bg-yellow-500" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>Member</SheetTitle>
        </SheetHeader>

        {member && (
          <>
            <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
              {/* Identity */}
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{initials(member.user.name)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">
                    {member.user.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {member.user.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant={memberStatusBadgeVariant(member.status)}>
                  {MEMBER_STATUS_LABELS[member.status]}
                </Badge>
                <Badge variant={isAdmin ? 'default' : 'outline'}>
                  {isAdmin ? 'Admin' : 'Member'}
                </Badge>
                {member.auto_debit_enabled && (
                  <Badge variant="success">Auto-debit on</Badge>
                )}
              </div>

              <Button variant="outline" className="w-full gap-2" asChild>
                <Link to="/users/$userId" params={{ userId: member.user.id }}>
                  <ExternalLink className="h-3.5 w-3.5" />
                  View user details
                </Link>
              </Button>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <Stat label="Coffer ID" value={member.user.coffer_id} />
                <Stat label="Joined" value={formatCabalDate(member.joined_at)} />
                <Stat
                  label="Contributed"
                  value={formatCabalMoney(member.total_contributed, currency)}
                />
                <Stat
                  label="Interest"
                  value={formatCabalMoney(member.interest_earned, currency)}
                />
                <Stat
                  label="Failed debits"
                  value={String(member.failed_debit_count)}
                />
                <Stat
                  label="Consistency"
                  value={`${Number(member.consistency_score).toFixed(0)}%`}
                />
              </div>
            </div>

            <SheetFooter className="flex-col gap-2 border-t border-border">
              {canChangeRole && (
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  disabled={busy}
                  onClick={() =>
                    setMemberRole({
                      memberId: member.id,
                      role: isAdmin ? 'member' : 'admin',
                    })
                  }
                >
                  {isAdmin ? (
                    <>
                      <ShieldOff className="h-4 w-4" />
                      Remove admin
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4" />
                      Make admin
                    </>
                  )}
                </Button>
              )}

              {canModerate && (
                <Button
                  variant={isSuspended ? 'default' : 'destructive'}
                  className="w-full gap-2"
                  disabled={busy}
                  onClick={() =>
                    setMemberStatus({
                      memberId: member.id,
                      status: isSuspended ? 'active' : 'suspended',
                    })
                  }
                >
                  {isSuspended ? (
                    <>
                      <RotateCcw className="h-4 w-4" />
                      Reinstate
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4" />
                      Suspend
                    </>
                  )}
                </Button>
              )}

              {!canModerate && (
                <p className="w-full text-center text-xs text-muted-foreground">
                  No actions available for {MEMBER_STATUS_LABELS[member.status]}{' '}
                  members.
                </p>
              )}
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
