/** A reusable HTML email body + subject referenced by email campaigns. */
export type EmailTemplate = {
  id: string;
  name: string;
  subject: string;
  html_body: string;
  declared_variables: Array<string>;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type EmailTemplateSummary = Pick<
  EmailTemplate,
  'id' | 'name' | 'subject'
>;

export type PlaceholderGroup = {
  title: string;
  description: string;
  items: Array<{ token: string; label: string }>;
};

/**
 * Placeholders an admin may reference in a template body, grouped for the
 * insert palette. Kept in sync with the backend `ALLOWED_PLACEHOLDERS`
 * (placeholder-extractor.ts). Financial values are per-recipient balances
 * computed at send time — ideal for a monthly portfolio email.
 */
export const PLACEHOLDER_GROUPS: Array<PlaceholderGroup> = [
  {
    title: 'Recipient',
    description: "The recipient's own details.",
    items: [
      { token: 'first_name', label: 'First name' },
      { token: 'last_name', label: 'Last name' },
      { token: 'email', label: 'Email' },
      { token: 'coffer_id', label: 'Coffer ID' },
    ],
  },
  {
    title: 'Balances',
    description: 'Per-recipient balances (NGN & USDT) at send time.',
    items: [
      { token: 'ngn_total_balance', label: 'Total (NGN)' },
      { token: 'usdt_total_balance', label: 'Total (USDT)' },
      { token: 'ngn_wallet_balance', label: 'Wallet (NGN)' },
      { token: 'usdt_wallet_balance', label: 'Wallet (USDT)' },
      { token: 'ngn_locker_balance', label: 'Locker (NGN)' },
      { token: 'usdt_locker_balance', label: 'Locker (USDT)' },
      { token: 'ngn_coffer_balance', label: 'Coffer (NGN)' },
      { token: 'usdt_coffer_balance', label: 'Coffer (USDT)' },
      { token: 'ngn_interest_earned', label: 'Interest earned (NGN)' },
      { token: 'usdt_interest_earned', label: 'Interest earned (USDT)' },
    ],
  },
  {
    title: 'Brand',
    description: 'Auto-filled from Coffer brand settings.',
    items: [
      { token: 'brand_name', label: 'Brand name' },
      { token: 'support_email', label: 'Support email' },
    ],
  },
];

/** Flat list of every allowed placeholder token — used by validation. */
export const ALLOWED_PLACEHOLDERS: Array<{ token: string; label: string }> =
  PLACEHOLDER_GROUPS.flatMap((g) => g.items);
