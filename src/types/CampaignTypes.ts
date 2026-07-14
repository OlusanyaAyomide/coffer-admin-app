export type CampaignChannel = 'email' | 'push';
export type CampaignStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'paused'
  | 'completed'
  | 'archived';
export type CampaignSchedule = 'immediate' | 'one_off' | 'recurring';

export type LastActive =
  | 'active_7d'
  | 'active_30d'
  | 'active_90d'
  | 'inactive_30d'
  | 'inactive_90d';

/** Preset audience filter — mirrors the backend AudienceFilter. */
export type AudienceFilter = {
  all?: boolean;
  status?: Array<AccountStatus>;
  account_tier?: Array<AccountTier>;
  country_id?: Array<string>;
  completion_status?: Array<CompletionStatus>;
  has_investment?: boolean;
  has_locks?: boolean;
  last_active?: LastActive;
  signup_after?: string;
  signup_before?: string;
};

export const LAST_ACTIVE_OPTIONS: Array<{ label: string; value: LastActive }> = [
  { label: 'Active in last 7 days', value: 'active_7d' },
  { label: 'Active in last 30 days', value: 'active_30d' },
  { label: 'Active in last 90 days', value: 'active_90d' },
  { label: 'Inactive for 30+ days', value: 'inactive_30d' },
  { label: 'Inactive for 90+ days', value: 'inactive_90d' },
];

export type AccountStatus = 'active' | 'under_revieiw' | 'deactivated';
export type AccountTier = 'NA' | 'band_a' | 'band_b' | 'band_c';
export type CompletionStatus =
  | 'step_0_account_created'
  | 'step_1_email_verified'
  | 'step_2_profile_completed'
  | 'onboard_completed';

export type CampaignTemplateSummary = {
  id: string;
  name: string;
  subject: string;
};

export type Campaign = {
  id: string;
  name: string;
  description: string | null;
  channel: CampaignChannel;
  status: CampaignStatus;
  template_id: string | null;
  Template: CampaignTemplateSummary | null;
  subject_override: string | null;
  push_title: string | null;
  push_body: string | null;
  push_data: Record<string, unknown> | null;
  audience: AudienceFilter;
  schedule_kind: CampaignSchedule;
  scheduled_at: string | null;
  cron_expression: string | null;
  next_run_at: string | null;
  last_run_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CampaignRun = {
  id: string;
  campaign_id: string;
  status: string;
  started_at: string;
  finished_at: string | null;
  matched_count: number;
  queued_count: number;
  sent_count: number;
  failed_count: number;
  skipped_opt_out_count: number;
  error: string | null;
};

export type AudiencePreviewUser = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  coffer_id: string;
};

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
  archived: 'Archived',
};

export const CAMPAIGN_SCHEDULE_LABELS: Record<CampaignSchedule, string> = {
  immediate: 'Send now',
  one_off: 'Scheduled (one-off)',
  recurring: 'Recurring',
};

export const ACCOUNT_STATUS_OPTIONS: Array<{ label: string; value: AccountStatus }> = [
  { label: 'Active', value: 'active' },
  { label: 'Under review', value: 'under_revieiw' },
  { label: 'Deactivated', value: 'deactivated' },
];

export const ACCOUNT_TIER_OPTIONS: Array<{ label: string; value: AccountTier }> = [
  { label: 'No tier (NA)', value: 'NA' },
  { label: 'Band A', value: 'band_a' },
  { label: 'Band B', value: 'band_b' },
  { label: 'Band C', value: 'band_c' },
];

export const COMPLETION_STATUS_OPTIONS: Array<{
  label: string;
  value: CompletionStatus;
}> = [
  { label: 'Account created', value: 'step_0_account_created' },
  { label: 'Email verified', value: 'step_1_email_verified' },
  { label: 'Profile completed', value: 'step_2_profile_completed' },
  { label: 'Onboarded', value: 'onboard_completed' },
];
