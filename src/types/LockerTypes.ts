export type LockerType = 'self_lock' | 'goal_lock' | 'cabal';

export type SavingsRate = {
  id: string;
  type: LockerType;
  base_rate: string;
  daily_rate: string;
  is_active: boolean;
  effective_from: string;
  effective_to: string | null;
  note: string | null;
  created_by: { id: string; name: string } | null;
  created_at: string;
  updated_at: string;
};

export type ActiveRateEntry = {
  type: LockerType;
  rate: SavingsRate | null;
  /** Up to 3 most-recent superseded rates, newest first. */
  previous: Array<SavingsRate>;
};

export const LOCKER_TYPE_LABELS: Record<LockerType, string> = {
  self_lock: 'Self-Lock',
  goal_lock: 'Goal-Lock',
  cabal: 'Cabal',
};

/**
 * Category applicability. Distinct from `LockerType` — a category targets
 * self-locks, goal-locks, or `both` (there is no cabal-only category type).
 */
export type SavingCategoryType = 'self_lock' | 'goal_lock' | 'both';

export const CATEGORY_TYPE_LABELS: Record<SavingCategoryType, string> = {
  self_lock: 'Self-Lock',
  goal_lock: 'Goal-Lock',
  both: 'Both',
};

/** Usage counts across every instrument that references the category. */
export type SavingsCategoryCount = {
  SelfLocks: number;
  GoalLocks: number;
  GroupSavings: number;
};

export type SavingsCategory = {
  id: string;
  name: string;
  description: string | null;
  icon_url: string | null;
  image_url: string | null;
  type: SavingCategoryType;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  _count?: SavingsCategoryCount;
};

/**
 * Per-product brand colors. Each locker type owns a hue used everywhere it
 * appears (card accent strip, icon chip, update-sheet band):
 *   Self-Lock → blue · Goal-Lock → purple/pink · Cabal → deep yellow.
 */
export type LockerTypeTheme = {
  /** Solid fill for accent strips / sheet bands. */
  accent: string;
  /** Text color matching the hue. */
  text: string;
  /** Soft tinted background for icon chips. */
  chip: string;
};

export const LOCKER_TYPE_THEME: Record<LockerType, LockerTypeTheme> = {
  self_lock: { accent: 'bg-blue-600', text: 'text-blue-600', chip: 'bg-blue-50' },
  goal_lock: { accent: 'bg-purple-600', text: 'text-purple-600', chip: 'bg-purple-50' },
  cabal: { accent: 'bg-yellow-500', text: 'text-yellow-600', chip: 'bg-yellow-50' },
};

export type EntryCurrency = 'NGN' | 'USDT';
export type ContributionFrequency = 'daily' | 'weekly' | 'monthly';
export type CabalVisibility = 'public' | 'private';
export type CabalGroupType = 'regular' | 'system';
export type GroupSavingStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'closed'
  | 'suspended';
export type GroupMemberStatus =
  | 'invited'
  | 'active'
  | 'removed'
  | 'left'
  | 'suspended';
export type CabalMemberRole = 'admin' | 'member';
export type GroupInvitationType = 'link' | 'code';

export type CabalCategory = {
  id: string;
  name: string;
  icon_url: string | null;
  image_url: string | null;
} | null;

export type CabalStats = {
  active_members: number;
  invited_members: number;
  removed_members: number;
  suspended_members: number;
  left_members: number;
  total_members: number;
  slots_remaining: number | null;
  total_contributed: string;
  total_interest_earned: string;
  progress_percent: string | null;
  auto_debit_enabled_count: number;
  failed_debit_count: number;
  average_consistency_score: string;
};

export type CabalCreator = {
  id: string;
  coffer_id: string;
  name: string;
  first_name?: string | null;
  last_name?: string | null;
  email: string;
  status?: string;
  country?: { id: string; name: string; flag: string } | null;
} | null;

export type CabalSummary = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  icon_url: string | null;
  visibility: CabalVisibility;
  goal_name: string | null;
  target_amount: string | null;
  currency: EntryCurrency;
  contribution_type: 'fixed' | 'flexible';
  contribution_frequency: ContributionFrequency;
  contribution_amount: string | null;
  max_members: number | null;
  is_featured: boolean;
  importance: number;
  is_company_group: boolean;
  groupType: CabalGroupType;
  promotional_bonus: string | null;
  status: GroupSavingStatus;
  start_date: string | null;
  end_date: string | null;
  category: CabalCategory;
  creator: CabalCreator;
  stats: CabalStats;
  closure_reason: string | null;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CabalDetail = CabalSummary & {
  invite_code: string | null;
  category_id: string | null;
};

export type CabalMember = {
  id: string;
  user: {
    id: string;
    coffer_id: string;
    name: string;
    first_name: string | null;
    last_name: string | null;
    email: string;
    status: string;
    profile_image_id: string | null;
  };
  role: CabalMemberRole;
  status: GroupMemberStatus;
  contribution_amount: string | null;
  contribution_day: number | null;
  contribution_time: string | null;
  next_debit_date: string | null;
  re_attempt_date_at: string | null;
  total_contributed: string;
  interest_earned: string;
  auto_debit_enabled: boolean;
  failed_debit_count: number;
  last_failed_debit_at: string | null;
  on_time_payments: number;
  missed_payments: number;
  consistency_score: string;
  joined_at: string | null;
  left_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CabalInvitation = {
  id: string;
  type: GroupInvitationType;
  token_or_link: string;
  usage_count: number;
  max_usage_count: number | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CabalActivity = {
  id: string;
  event: string;
  description: string | null;
  daily_rate: string | null;
  principal_at_time: string | null;
  interest_amount: string | null;
  is_compounded: boolean | null;
  currency: EntryCurrency | null;
  meta_data: unknown;
  created_at: string;
  member: {
    id: string;
    user: {
      id: string;
      coffer_id: string;
      first_name: string | null;
      last_name: string | null;
      email: string;
    };
  } | null;
};

export type CabalDetailResponseData = {
  cabal: CabalDetail;
  stats: CabalStats;
  members: Array<CabalMember>;
  invitations: Array<CabalInvitation>;
  recent_activity: Array<CabalActivity>;
};
