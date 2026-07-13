export type BannerLinkType = 'none' | 'internal_route' | 'external_url';
export type BannerStatus = 'draft' | 'published';

/** A promotional banner shown in the mobile home carousel. */
export type Banner = {
  id: string;
  title: string;
  description: string | null;
  image_url: string;
  link_type: BannerLinkType;
  link_target: string | null;
  sort_order: number;
  status: BannerStatus;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
};

export const BANNER_STATUS_LABELS: Record<BannerStatus, string> = {
  draft: 'Draft',
  published: 'Published',
};

export const BANNER_LINK_TYPE_LABELS: Record<BannerLinkType, string> = {
  none: 'No link',
  internal_route: 'In-app route',
  external_url: 'External URL',
};

/**
 * The in-app destinations a banner may deep-link to. Admins pick from these
 * rather than typing a route, so a banner can never point at a screen that
 * doesn't exist. Keep in sync with the backend whitelist
 * (`BANNER_INTERNAL_ROUTES` in coffer's banner.service.ts) and the mobile
 * Expo Router routes.
 */
export const BANNER_INTERNAL_ROUTES: Array<{ label: string; value: string }> = [
  { label: 'Home', value: '/(tabs)/home' },
  { label: 'Wallet', value: '/(tabs)/wallet' },
  { label: 'Locker', value: '/(tabs)/locker' },
  { label: 'Coffer (Invest)', value: '/coffer' },
  { label: 'Self Lock', value: '/locker/self-lock' },
  { label: 'Goal Lock', value: '/locker/goal-lock' },
  { label: 'Cabal', value: '/locker/cabal' },
  { label: 'Top Up / Deposit', value: '/wallet/top-up' },
  { label: 'Send', value: '/wallet/send' },
  { label: 'Withdraw', value: '/wallet/withdraw' },
  { label: 'Convert', value: '/wallet/convert' },
  { label: 'Verify identity (KYC)', value: '/(kyc)' },
];
