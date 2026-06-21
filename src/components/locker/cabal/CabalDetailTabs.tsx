import { useState } from 'react';
import { Link } from '@tanstack/react-router';

import type { CabalDetailResponseData, CabalMember } from '@/types/LockerTypes';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CABAL_STATUS_LABELS,
  CONTRIBUTION_FREQUENCY_LABELS,
  MEMBER_STATUS_LABELS,
  cabalStatusBadgeVariant,
  formatCabalDate,
  formatCabalDateTime,
  formatCabalMoney,
  memberStatusBadgeVariant,
} from '@/lib/cabalFormat';
import CabalMemberSheet from '@/components/locker/cabal/CabalMemberSheet';

const TAB_TRIGGER_CLASS =
  'rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground';

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

export default function CabalDetailTabs({
  detail,
}: {
  detail: CabalDetailResponseData;
}) {
  const { cabal, members, invitations, recent_activity } = detail;
  const currency = cabal.currency;

  const [selectedMember, setSelectedMember] = useState<CabalMember | null>(
    null,
  );
  const [memberSheetOpen, setMemberSheetOpen] = useState(false);

  const openMember = (member: CabalMember) => {
    setSelectedMember(member);
    setMemberSheetOpen(true);
  };

  return (
    <>
    <Tabs defaultValue="overview" className="w-full space-y-6">
      <div className="sticky top-16 z-30 -mx-1 -mt-2 overflow-x-auto bg-background px-1 pt-2">
        <TabsList className="h-auto w-max min-w-full flex-nowrap justify-start space-x-6 rounded-none border-b border-border bg-transparent p-0">
          <TabsTrigger value="overview" className={TAB_TRIGGER_CLASS}>
            Overview
          </TabsTrigger>
          <TabsTrigger value="members" className={TAB_TRIGGER_CLASS}>
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
            Activity
          </TabsTrigger>
          <TabsTrigger value="invitations" className={TAB_TRIGGER_CLASS}>
            Invitations ({invitations.length})
          </TabsTrigger>
          <TabsTrigger value="config" className={TAB_TRIGGER_CLASS}>
            Config
          </TabsTrigger>
        </TabsList>
      </div>

      {/* Overview */}
      <TabsContent value="overview" className="space-y-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-5 rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">Goal</h3>
            <Field label="Goal name">{cabal.goal_name ?? '—'}</Field>
            <Field label="Description">
              {cabal.description ?? '—'}
            </Field>
            <Field label="Category">
              {cabal.category?.name ? (
                <Badge variant="outline">{cabal.category.name}</Badge>
              ) : (
                '—'
              )}
            </Field>
            <Field label="Target amount">
              {cabal.target_amount
                ? formatCabalMoney(cabal.target_amount, currency)
                : 'No target'}
            </Field>
          </div>

          <div className="space-y-5 rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Contribution schedule
            </h3>
            <Field label="Amount">
              {formatCabalMoney(cabal.contribution_amount, currency)}
            </Field>
            <Field label="Frequency">
              {CONTRIBUTION_FREQUENCY_LABELS[cabal.contribution_frequency]}
            </Field>
            <Field label="Currency">{currency}</Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Start date">
                {formatCabalDate(cabal.start_date)}
              </Field>
              <Field label="End date">
                {formatCabalDate(cabal.end_date)}
              </Field>
            </div>
          </div>

          {cabal.creator && (
            <div className="space-y-5 rounded-lg border border-border bg-card p-5">
              <h3 className="text-sm font-semibold text-foreground">Creator</h3>
              <Field label="Name">
                <Link
                  to="/users/$userId"
                  params={{ userId: cabal.creator.id }}
                  className="text-primary hover:underline"
                >
                  {cabal.creator.name}
                </Link>
              </Field>
              <Field label="Email">{cabal.creator.email}</Field>
              <Field label="Coffer ID">{cabal.creator.coffer_id}</Field>
              {cabal.creator.country?.name && (
                <Field label="Country">{cabal.creator.country.name}</Field>
              )}
            </div>
          )}

          <div className="space-y-5 rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Visibility & rail
            </h3>
            <Field label="Visibility">
              <span className="capitalize">{cabal.visibility}</span>
            </Field>
            <Field label="Group type">
              <span className="capitalize">{cabal.groupType}</span>
            </Field>
            <Field label="Featured">
              {cabal.is_featured ? (
                <Badge variant="secondary">
                  Featured · importance {cabal.importance}
                </Badge>
              ) : (
                'Not featured'
              )}
            </Field>
            <Field label="Company group">
              {cabal.is_company_group ? 'Yes' : 'No'}
            </Field>
          </div>
        </div>
      </TabsContent>

      {/* Members */}
      <TabsContent value="members">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-[#0a1f44] text-xs uppercase tracking-wider text-white">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Member</th>
                <th className="px-4 py-3 text-left font-medium">Role</th>
                <th className="px-4 py-3 text-left font-medium">Status</th>
                <th className="px-4 py-3 text-right font-medium">Contributed</th>
                <th className="px-4 py-3 text-right font-medium">Interest</th>
                <th className="px-4 py-3 text-center font-medium">Auto-debit</th>
                <th className="px-4 py-3 text-right font-medium">Failed</th>
                <th className="px-4 py-3 text-right font-medium">Consistency</th>
                <th className="px-4 py-3 text-left font-medium">Joined</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No members yet.
                  </td>
                </tr>
              ) : (
                members.map((member) => (
                  <tr key={member.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <Link
                        to="/users/$userId"
                        params={{ userId: member.user.id }}
                        className="font-medium text-primary hover:underline"
                      >
                        {member.user.name}
                      </Link>
                      <p className="text-xs text-muted-foreground">
                        {member.user.email}
                      </p>
                    </td>
                    <td className="px-4 py-3 capitalize text-foreground">
                      {member.role}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={memberStatusBadgeVariant(member.status)}>
                        {MEMBER_STATUS_LABELS[member.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCabalMoney(member.total_contributed, currency)}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {formatCabalMoney(member.interest_earned, currency)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {member.auto_debit_enabled ? (
                        <Badge variant="success">On</Badge>
                      ) : (
                        <Badge variant="outline">Off</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {member.failed_debit_count}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {Number(member.consistency_score).toFixed(0)}%
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatCabalDate(member.joined_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMember(member)}
                      >
                        Manage
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* Activity */}
      <TabsContent value="activity">
        <div className="rounded-lg border border-border bg-card">
          {recent_activity.length === 0 ? (
            <p className="px-4 py-8 text-center text-muted-foreground">
              No recent activity.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {recent_activity.map((log) => (
                <li
                  key={log.id}
                  className="flex items-start justify-between gap-4 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium capitalize text-foreground">
                      {log.event.replace(/_/g, ' ')}
                    </p>
                    {log.description && (
                      <p className="text-xs text-muted-foreground">
                        {log.description}
                      </p>
                    )}
                    {log.member?.user && (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {[
                          log.member.user.first_name,
                          log.member.user.last_name,
                        ]
                          .filter(Boolean)
                          .join(' ') || log.member.user.email}
                      </p>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {log.interest_amount && (
                      <p className="text-sm font-medium text-emerald-600">
                        +{formatCabalMoney(log.interest_amount, currency)}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatCabalDateTime(log.created_at)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </TabsContent>

      {/* Invitations */}
      <TabsContent value="invitations">
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-[#0a1f44] text-xs uppercase tracking-wider text-white">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Type</th>
                <th className="px-4 py-3 text-left font-medium">Token / link</th>
                <th className="px-4 py-3 text-right font-medium">Usage</th>
                <th className="px-4 py-3 text-left font-medium">Expires</th>
                <th className="px-4 py-3 text-left font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {invitations.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No invitations.
                  </td>
                </tr>
              ) : (
                invitations.map((inv) => (
                  <tr key={inv.id} className="hover:bg-muted/40">
                    <td className="px-4 py-3 capitalize text-foreground">
                      {inv.type}
                    </td>
                    <td className="max-w-[28vw] truncate px-4 py-3 font-mono text-xs text-foreground">
                      {inv.token_or_link}
                    </td>
                    <td className="px-4 py-3 text-right text-foreground">
                      {inv.usage_count}
                      {inv.max_usage_count ? ` / ${inv.max_usage_count}` : ''}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatCabalDate(inv.expires_at)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatCabalDate(inv.created_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </TabsContent>

      {/* Config */}
      <TabsContent value="config">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="space-y-5 rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">
              Configuration
            </h3>
            <Field label="Status">
              <Badge variant={cabalStatusBadgeVariant(cabal.status)}>
                {CABAL_STATUS_LABELS[cabal.status]}
              </Badge>
            </Field>
            <Field label="Max members">
              {cabal.max_members ?? 'Unlimited'}
            </Field>
            <Field label="Promotional bonus">
              {cabal.promotional_bonus
                ? formatCabalMoney(cabal.promotional_bonus, currency)
                : '—'}
            </Field>
            <Field label="Invite code">
              {cabal.invite_code ?? '—'}
            </Field>
          </div>

          <div className="space-y-5 rounded-lg border border-border bg-card p-5">
            <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
            <Field label="Created">
              {formatCabalDateTime(cabal.created_at)}
            </Field>
            <Field label="Last updated">
              {formatCabalDateTime(cabal.updated_at)}
            </Field>
            {cabal.closed_at && (
              <Field label="Closed">
                {formatCabalDateTime(cabal.closed_at)}
              </Field>
            )}
            {cabal.closure_reason && (
              <Field label="Closure reason">{cabal.closure_reason}</Field>
            )}
          </div>
        </div>
      </TabsContent>
    </Tabs>

    <CabalMemberSheet
      cabalId={cabal.id}
      currency={currency}
      member={selectedMember}
      open={memberSheetOpen}
      onOpenChange={setMemberSheetOpen}
    />
    </>
  );
}
