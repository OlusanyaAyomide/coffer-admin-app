import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  Coins,
  ExternalLink,
  LockKeyhole,
  Repeat,
  Users,
  WalletCards,
} from 'lucide-react';

import type {
  EntryCurrency,
  UserCabalMembership,
  UserGoalLock,
  UserLockerActivity,
  UserSelfLock,
} from '@/types/LockerTypes';
import type { PaginationType } from '@/types/ResponseTypes';
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
import { formatDateToReadableShort } from '@/services/TimeServices';
import useUserLocker from '@/hooks/useUserLocker';
import useUserLockerActivities from '@/hooks/useUserLockerActivities';
import { StatCard } from '@/components/shared/StatCard';
import TablePaginator from '@/components/shared/TablePaginator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

type SelectedLocker =
  | { type: 'self_lock'; data: UserSelfLock }
  | { type: 'goal_lock'; data: UserGoalLock }
  | { type: 'cabal'; data: UserCabalMembership }
  | null;

const TAB_TRIGGER_CLASS =
  'rounded-none border-b-2 border-transparent px-2 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground';

const SAVING_STATUS_LABELS: Record<UserSelfLock['status'], string> = {
  active: 'Active',
  matured: 'Matured',
  closed: 'Closed',
  suspended: 'Suspended',
};

function savingStatusBadgeVariant(status: UserSelfLock['status']) {
  switch (status) {
    case 'active':
      return 'success';
    case 'matured':
      return 'secondary';
    case 'closed':
    case 'suspended':
      return 'destructive';
    default:
      return 'outline';
  }
}

function money(value: string | number | null | undefined, currency: EntryCurrency) {
  return formatCabalMoney(value, currency);
}

function totalMoney(capital: string, interest: string) {
  return Number(capital || 0) + Number(interest || 0);
}

function lockerActivityAmount(activity: UserLockerActivity) {
  if (activity.amount) return activity.amount;

  if (
    activity.meta_data &&
    typeof activity.meta_data === 'object' &&
    'amount' in activity.meta_data
  ) {
    const amount = (activity.meta_data as { amount?: unknown }).amount;
    if (typeof amount === 'string' || typeof amount === 'number') {
      return amount;
    }
  }

  return null;
}

function activityAmountPrefix(direction: UserLockerActivity['amount_direction']) {
  if (direction === 'credit') return '+';
  if (direction === 'debit') return '-';
  return '';
}

function activityAmountClassName(direction: UserLockerActivity['amount_direction']) {
  if (direction === 'credit') return 'text-emerald-600';
  if (direction === 'debit') return 'text-foreground';
  return 'text-foreground';
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex h-28 items-center justify-center rounded-lg border border-dashed border-border">
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}

function TableShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full min-w-[900px] text-sm">{children}</table>
    </div>
  );
}

function HeadCell({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <th
      className={cn(
        'bg-brand px-4 py-3.5 text-xs font-medium uppercase tracking-wider text-white',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
        align === 'left' && 'text-left',
      )}
    >
      {children}
    </th>
  );
}

function Cell({
  children,
  align = 'left',
}: {
  children: React.ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  return (
    <td
      className={cn(
        'px-4 py-3 text-muted-foreground',
        align === 'right' && 'text-right',
        align === 'center' && 'text-center',
      )}
    >
      {children}
    </td>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="text-sm text-foreground">{value || '-'}</div>
    </div>
  );
}

function LockerDetailSheet({
  selected,
  onOpenChange,
}: {
  selected: SelectedLocker;
  onOpenChange: (open: boolean) => void;
}) {
  const open = Boolean(selected);
  const title =
    selected?.type === 'cabal'
      ? selected.data.cabal.name
      : selected?.data.title ?? 'Locker';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full p-0 sm:max-w-3xl">
        <div className="h-1.5 w-full shrink-0 bg-brand" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        {selected && (
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            {selected.type === 'self_lock' && (
              <SelfLockDetails lock={selected.data} />
            )}
            {selected.type === 'goal_lock' && (
              <GoalLockDetails lock={selected.data} />
            )}
            {selected.type === 'cabal' && (
              <CabalDetails membership={selected.data} />
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function SelfLockDetails({ lock }: { lock: UserSelfLock }) {
  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Product" value="Self-Lock" />
        <DetailField
          label="Status"
          value={
            <Badge variant={savingStatusBadgeVariant(lock.status)}>
              {SAVING_STATUS_LABELS[lock.status]}
            </Badge>
          }
        />
        <DetailField label="Category" value={lock.category?.name ?? '-'} />
        <DetailField label="Currency" value={lock.currency} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <DetailField
          label="Principal"
          value={money(lock.locked_amount, lock.currency)}
        />
        <DetailField
          label="Total deposited"
          value={money(lock.total_deposited, lock.currency)}
        />
        <DetailField
          label="Interest earned"
          value={money(lock.interest_earned, lock.currency)}
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <DetailField
          label="Created"
          value={formatDateToReadableShort(lock.created_at)}
        />
        <DetailField
          label="Maturity"
          value={formatDateToReadableShort(lock.maturity_date)}
        />
        <DetailField
          label="Closed"
          value={lock.closed_at ? formatDateToReadableShort(lock.closed_at) : '-'}
        />
        <DetailField label="Closure reason" value={lock.closure_reason ?? '-'} />
      </section>
    </>
  );
}

function GoalLockDetails({ lock }: { lock: UserGoalLock }) {
  return (
    <>
      <SelfLockDetails lock={lock} />
      <section className="grid gap-4 border-t border-border pt-5 sm:grid-cols-3">
        <DetailField
          label="Target"
          value={
            lock.target_amount ? money(lock.target_amount, lock.currency) : '-'
          }
        />
        <DetailField
          label="Contribution"
          value={
            lock.contribution_amount
              ? money(lock.contribution_amount, lock.currency)
              : '-'
          }
        />
        <DetailField
          label="Frequency"
          value={
            lock.contribution_frequency
              ? CONTRIBUTION_FREQUENCY_LABELS[lock.contribution_frequency]
              : '-'
          }
        />
        <DetailField
          label="Next debit"
          value={
            lock.next_debit_date
              ? formatDateToReadableShort(lock.next_debit_date)
              : '-'
          }
        />
        <DetailField
          label="Auto-debit"
          value={
            <Badge variant={lock.auto_debit_enabled ? 'success' : 'outline'}>
              {lock.auto_debit_enabled ? 'On' : 'Off'}
            </Badge>
          }
        />
        <DetailField label="Failed debits" value={lock.failed_debit_count} />
      </section>
    </>
  );
}

function CabalDetails({ membership }: { membership: UserCabalMembership }) {
  const { cabal } = membership;

  return (
    <>
      <section className="grid gap-4 sm:grid-cols-2">
        <DetailField label="Product" value="Cabal" />
        <DetailField
          label="Cabal status"
          value={
            <Badge variant={cabalStatusBadgeVariant(cabal.status)}>
              {CABAL_STATUS_LABELS[cabal.status]}
            </Badge>
          }
        />
        <DetailField label="Goal" value={cabal.goal_name ?? '-'} />
        <DetailField label="Category" value={cabal.category?.name ?? '-'} />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <DetailField
          label="Contributed"
          value={money(membership.total_contributed, cabal.currency)}
        />
        <DetailField
          label="Interest"
          value={money(membership.interest_earned, cabal.currency)}
        />
        <DetailField
          label="Contribution"
          value={
            membership.contribution_amount
              ? money(membership.contribution_amount, cabal.currency)
              : cabal.contribution_amount
                ? money(cabal.contribution_amount, cabal.currency)
                : '-'
          }
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <DetailField label="Role" value={<span className="capitalize">{membership.role}</span>} />
        <DetailField
          label="Member status"
          value={
            <Badge variant={memberStatusBadgeVariant(membership.status)}>
              {MEMBER_STATUS_LABELS[membership.status]}
            </Badge>
          }
        />
        <DetailField
          label="Consistency"
          value={`${Number(membership.consistency_score || 0).toFixed(0)}%`}
        />
        <DetailField
          label="Auto-debit"
          value={
            <Badge variant={membership.auto_debit_enabled ? 'success' : 'outline'}>
              {membership.auto_debit_enabled ? 'On' : 'Off'}
            </Badge>
          }
        />
        <DetailField label="Failed debits" value={membership.failed_debit_count} />
        <DetailField
          label="Next debit"
          value={
            membership.next_debit_date
              ? formatDateToReadableShort(membership.next_debit_date)
              : '-'
          }
        />
      </section>

      <Button asChild variant="outline" className="gap-2">
        <Link to="/locker/cabals/$cabalId" params={{ cabalId: cabal.id }}>
          <ExternalLink className="h-4 w-4" />
          Open cabal
        </Link>
      </Button>
    </>
  );
}

function SelfLocksTable({
  rows,
  onSelect,
}: {
  rows: Array<UserSelfLock>;
  onSelect: (row: UserSelfLock) => void;
}) {
  if (!rows.length) return <EmptyState label="No Self-Locks for this user." />;

  return (
    <TableShell>
      <thead>
        <tr>
          <HeadCell>Title</HeadCell>
          <HeadCell>Status</HeadCell>
          <HeadCell align="right">Principal</HeadCell>
          <HeadCell align="right">Interest</HeadCell>
          <HeadCell>Maturity</HeadCell>
          <HeadCell>Category</HeadCell>
          <HeadCell align="right">Actions</HeadCell>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((lock) => (
          <tr key={lock.id} className="hover:bg-muted/40 even:bg-muted/40">
            <Cell>
              <p className="font-medium text-foreground">{lock.title}</p>
              <p className="text-xs text-muted-foreground">{lock.currency}</p>
            </Cell>
            <Cell>
              <Badge variant={savingStatusBadgeVariant(lock.status)}>
                {SAVING_STATUS_LABELS[lock.status]}
              </Badge>
            </Cell>
            <Cell align="right">{money(lock.locked_amount, lock.currency)}</Cell>
            <Cell align="right">{money(lock.interest_earned, lock.currency)}</Cell>
            <Cell>{formatCabalDate(lock.maturity_date)}</Cell>
            <Cell>{lock.category?.name ?? '-'}</Cell>
            <Cell align="right">
              <Button variant="outline" size="sm" onClick={() => onSelect(lock)}>
                View
              </Button>
            </Cell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function GoalLocksTable({
  rows,
  onSelect,
}: {
  rows: Array<UserGoalLock>;
  onSelect: (row: UserGoalLock) => void;
}) {
  if (!rows.length) return <EmptyState label="No Goal-Locks for this user." />;

  return (
    <TableShell>
      <thead>
        <tr>
          <HeadCell>Title</HeadCell>
          <HeadCell>Status</HeadCell>
          <HeadCell align="right">Principal</HeadCell>
          <HeadCell align="right">Interest</HeadCell>
          <HeadCell>Schedule</HeadCell>
          <HeadCell align="right">Failed</HeadCell>
          <HeadCell align="right">Actions</HeadCell>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((lock) => (
          <tr key={lock.id} className="hover:bg-muted/40 even:bg-muted/40">
            <Cell>
              <p className="font-medium text-foreground">{lock.title}</p>
              <p className="text-xs text-muted-foreground">
                Target:{' '}
                {lock.target_amount ? money(lock.target_amount, lock.currency) : '-'}
              </p>
            </Cell>
            <Cell>
              <Badge variant={savingStatusBadgeVariant(lock.status)}>
                {SAVING_STATUS_LABELS[lock.status]}
              </Badge>
            </Cell>
            <Cell align="right">{money(lock.locked_amount, lock.currency)}</Cell>
            <Cell align="right">{money(lock.interest_earned, lock.currency)}</Cell>
            <Cell>
              {lock.contribution_frequency
                ? CONTRIBUTION_FREQUENCY_LABELS[lock.contribution_frequency]
                : '-'}
            </Cell>
            <Cell align="right">{lock.failed_debit_count}</Cell>
            <Cell align="right">
              <Button variant="outline" size="sm" onClick={() => onSelect(lock)}>
                View
              </Button>
            </Cell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function CabalsTable({
  rows,
  onSelect,
}: {
  rows: Array<UserCabalMembership>;
  onSelect: (row: UserCabalMembership) => void;
}) {
  if (!rows.length) return <EmptyState label="No Cabal memberships for this user." />;

  return (
    <TableShell>
      <thead>
        <tr>
          <HeadCell>Cabal</HeadCell>
          <HeadCell>Member status</HeadCell>
          <HeadCell align="right">Contributed</HeadCell>
          <HeadCell align="right">Interest</HeadCell>
          <HeadCell align="right">Consistency</HeadCell>
          <HeadCell>Joined</HeadCell>
          <HeadCell align="right">Actions</HeadCell>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {rows.map((membership) => (
          <tr key={membership.id} className="hover:bg-muted/40 even:bg-muted/40">
            <Cell>
              <p className="font-medium text-foreground">{membership.cabal.name}</p>
              <p className="text-xs text-muted-foreground">
                {membership.cabal.currency}  -  {membership.role}
              </p>
            </Cell>
            <Cell>
              <Badge variant={memberStatusBadgeVariant(membership.status)}>
                {MEMBER_STATUS_LABELS[membership.status]}
              </Badge>
            </Cell>
            <Cell align="right">
              {money(membership.total_contributed, membership.cabal.currency)}
            </Cell>
            <Cell align="right">
              {money(membership.interest_earned, membership.cabal.currency)}
            </Cell>
            <Cell align="right">
              {Number(membership.consistency_score || 0).toFixed(0)}%
            </Cell>
            <Cell>{formatCabalDate(membership.joined_at)}</Cell>
            <Cell align="right">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect(membership)}
              >
                View
              </Button>
            </Cell>
          </tr>
        ))}
      </tbody>
    </TableShell>
  );
}

function ActivityList({
  rows,
  meta,
  isLoading,
  isError,
  setPage,
}: {
  rows: Array<UserLockerActivity>;
  meta: PaginationType | null;
  isLoading: boolean;
  isError: boolean;
  setPage: React.Dispatch<React.SetStateAction<number>>;
}) {
  if (isLoading) {
    return <Skeleton className="h-64 rounded-xl" />;
  }

  if (isError) {
    return <EmptyState label="Could not load locker activity." />;
  }

  if (!rows.length) return <EmptyState label="No locker activity yet." />;

  return (
    <div>
      <div className="rounded-lg border border-border bg-card">
        <ul className="divide-y divide-border">
          {rows.map((activity) => {
            const activityAmount = lockerActivityAmount(activity);

            return (
              <li
                key={activity.id}
                className="flex items-start justify-between gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium capitalize text-foreground">
                    {activity.event.replace(/_/g, ' ')}
                  </p>
                  <p className="text-xs capitalize text-muted-foreground">
                    {activity.source.replace(/_/g, '-')}
                  </p>
                  {activity.description && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {activity.description}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 items-start gap-3 text-right">
                  <div>
                    {activityAmount && activity.amount_currency && (
                      <p
                        className={cn(
                          'text-sm font-medium',
                          activityAmountClassName(activity.amount_direction),
                        )}
                      >
                        {activityAmountPrefix(activity.amount_direction)}
                        {money(activityAmount, activity.amount_currency)}
                      </p>
                    )}
                    {!activityAmount && !activity.interest_amount && (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatCabalDateTime(activity.created_at)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => undefined}
                  >
                    View
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {meta && (
        <TablePaginator
          meta={meta}
          setPage={setPage}
          showPagination={meta.total_page > 1}
        />
      )}
    </div>
  );
}

export default function LockerTab({ userId }: { userId: string }) {
  const { lockerData, isLockerLoading, isLockerError } = useUserLocker({
    userId,
  });
  const [activityPage, setActivityPage] = useState(1);
  const {
    activities,
    meta: activityMeta,
    isActivitiesLoading,
    isActivitiesError,
  } = useUserLockerActivities({
    userId,
    page: activityPage,
    limit: 20,
  });
  const [selected, setSelected] = useState<SelectedLocker>(null);

  const totals = useMemo(() => {
    const ngn = lockerData?.overview.NGN;
    const usdt = lockerData?.overview.USDT;
    const converted = lockerData?.overview.converted_total;
    return {
      ngn: totalMoney(ngn?.capital ?? '0', ngn?.interest_accrued ?? '0'),
      usdt: totalMoney(usdt?.capital ?? '0', usdt?.interest_accrued ?? '0'),
      convertedNgn: Number(converted?.NGN ?? 0),
      convertedUsdt: Number(converted?.USDT ?? 0),
      rate: Number(converted?.rate ?? 0),
      capitalNgn: Number(ngn?.capital ?? 0),
      capitalUsdt: Number(usdt?.capital ?? 0),
      interestNgn: Number(ngn?.interest_accrued ?? 0),
      interestUsdt: Number(usdt?.interest_accrued ?? 0),
    };
  }, [lockerData]);

  if (isLockerLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Skeleton key={item} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-72 rounded-xl" />
      </div>
    );
  }

  if (isLockerError || !lockerData) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-lg border border-dashed border-border">
        <p className="text-muted-foreground">Could not load locker records.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <StatCard
          title="Combined total"
          value={
            <div className="space-y-1 text-2xl leading-tight">
              <div>{formatCabalMoney(totals.convertedNgn, 'NGN')}</div>
              <div>{formatCabalMoney(totals.convertedUsdt, 'USDT')}</div>
            </div>
          }
          subValue={
            <span className="block leading-5">
              Converted reference only.
              {totals.rate
                ? ` 1 USDT = ${formatCabalMoney(totals.rate, 'NGN')}`
                : ''}
            </span>
          }
          icon={Coins}
          accentClassName="bg-brand"
        />
        <StatCard
          title="NGN savings"
          value={formatCabalMoney(totals.ngn, 'NGN')}
          subValue={`${formatCabalMoney(totals.capitalNgn, 'NGN')} capital + ${formatCabalMoney(
            totals.interestNgn,
            'NGN',
          )} interest`}
          icon={WalletCards}
          accentClassName="bg-emerald-600"
          iconColor="text-emerald-600"
        />
        <StatCard
          title="USDT savings"
          value={formatCabalMoney(totals.usdt, 'USDT')}
          subValue={`${formatCabalMoney(totals.capitalUsdt, 'USDT')} capital + ${formatCabalMoney(
            totals.interestUsdt,
            'USDT',
          )} interest`}
          icon={WalletCards}
          accentClassName="bg-sky-600"
          iconColor="text-sky-600"
        />
        <StatCard
          title="Self-Lock"
          value={String(lockerData.overview.counts.self_lock)}
          subValue="Solo fixed locker records"
          icon={LockKeyhole}
          accentClassName="bg-blue-600"
          iconColor="text-blue-600"
        />
        <StatCard
          title="Goal-Lock"
          value={String(lockerData.overview.counts.goal_lock)}
          subValue="Recurring savings records"
          icon={Repeat}
          accentClassName="bg-purple-600"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Cabal"
          value={String(lockerData.overview.counts.cabal)}
          subValue="Group savings memberships"
          icon={Users}
          accentClassName="bg-yellow-500"
          iconColor="text-yellow-600"
        />
      </div>

      <Tabs defaultValue="self_lock" className="w-full space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="h-auto w-max min-w-full flex-nowrap justify-start space-x-6 rounded-none border-b border-border bg-transparent p-0">
            <TabsTrigger value="self_lock" className={TAB_TRIGGER_CLASS}>
              Self-Lock ({lockerData.self_locks.length})
            </TabsTrigger>
            <TabsTrigger value="goal_lock" className={TAB_TRIGGER_CLASS}>
              Goal-Lock ({lockerData.goal_locks.length})
            </TabsTrigger>
            <TabsTrigger value="cabal" className={TAB_TRIGGER_CLASS}>
              Cabal ({lockerData.cabals.length})
            </TabsTrigger>
            <TabsTrigger value="activity" className={TAB_TRIGGER_CLASS}>
              Activity ({activityMeta?.total ?? activities.length})
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="self_lock">
          <SelfLocksTable
            rows={lockerData.self_locks}
            onSelect={(row) => setSelected({ type: 'self_lock', data: row })}
          />
        </TabsContent>

        <TabsContent value="goal_lock">
          <GoalLocksTable
            rows={lockerData.goal_locks}
            onSelect={(row) => setSelected({ type: 'goal_lock', data: row })}
          />
        </TabsContent>

        <TabsContent value="cabal">
          <CabalsTable
            rows={lockerData.cabals}
            onSelect={(row) => setSelected({ type: 'cabal', data: row })}
          />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityList
            rows={activities}
            meta={activityMeta}
            isLoading={isActivitiesLoading}
            isError={isActivitiesError}
            setPage={setActivityPage}
          />
        </TabsContent>
      </Tabs>

      <LockerDetailSheet
        selected={selected}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />
    </div>
  );
}
