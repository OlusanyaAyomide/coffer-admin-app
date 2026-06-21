import type {
  ContributionFrequency,
  EntryCurrency,
  GroupMemberStatus,
  GroupSavingStatus,
} from '@/types/LockerTypes';

const CURRENCY_SYMBOL: Record<EntryCurrency, string> = {
  NGN: '₦',
  USDT: '$',
};

/** Format a decimal-string money value with its currency symbol. */
export function formatCabalMoney(
  value: string | number | null | undefined,
  currency: EntryCurrency = 'NGN',
): string {
  const amount = Number(value ?? 0);
  const safe = Number.isFinite(amount) ? amount : 0;
  return `${CURRENCY_SYMBOL[currency]}${safe.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

const DATE_FMT: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

export function formatCabalDate(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-US', DATE_FMT);
}

export function formatCabalDateTime(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return `${date.toLocaleDateString('en-US', DATE_FMT)}, ${date.toLocaleTimeString(
    'en-US',
    { hour: '2-digit', minute: '2-digit' },
  )}`;
}

export const CONTRIBUTION_FREQUENCY_LABELS: Record<
  ContributionFrequency,
  string
> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
};

export const CABAL_STATUS_LABELS: Record<GroupSavingStatus, string> = {
  pending: 'Pending',
  active: 'Active',
  completed: 'Completed',
  closed: 'Closed',
  suspended: 'Suspended',
};

type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'destructive'
  | 'success'
  | 'outline';

export function cabalStatusBadgeVariant(
  status: GroupSavingStatus,
): BadgeVariant {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'secondary';
    case 'pending':
      return 'outline';
    case 'suspended':
    case 'closed':
      return 'destructive';
    default:
      return 'outline';
  }
}

export const MEMBER_STATUS_LABELS: Record<GroupMemberStatus, string> = {
  invited: 'Invited',
  active: 'Active',
  removed: 'Removed',
  left: 'Left',
  suspended: 'Suspended',
};

export function memberStatusBadgeVariant(
  status: GroupMemberStatus,
): BadgeVariant {
  switch (status) {
    case 'active':
      return 'success';
    case 'invited':
      return 'outline';
    case 'left':
      return 'secondary';
    case 'removed':
    case 'suspended':
      return 'destructive';
    default:
      return 'outline';
  }
}

/** Clamp a 0–100 progress string to a usable percentage number. */
export function progressToPercent(
  value: string | number | null | undefined,
): number {
  const n = Number(value ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}
