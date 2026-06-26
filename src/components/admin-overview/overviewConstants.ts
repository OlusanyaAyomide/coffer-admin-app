import type {
  EntryCurrency,
  GroupSavingStatus,
  LockerType,
} from '@/types/LockerTypes';
import { CABAL_STATUS_LABELS } from '@/lib/cabalFormat';

export const TOP_CABAL_LIMIT = 10;

export const LOCKER_TYPES: Array<LockerType> = [
  'self_lock',
  'goal_lock',
  'cabal',
];

export const CABAL_STATUSES: Array<GroupSavingStatus> = [
  'pending',
  'active',
  'completed',
  'suspended',
  'closed',
];

export const CABAL_CURRENCIES: Array<EntryCurrency> = ['NGN', 'USDT'];

export const STATUS_FILTER_OPTIONS = CABAL_STATUSES.map((status) => ({
  label: CABAL_STATUS_LABELS[status],
  value: status,
}));

export const CURRENCY_FILTER_OPTIONS = CABAL_CURRENCIES.map((currency) => ({
  label: currency,
  value: currency,
}));
