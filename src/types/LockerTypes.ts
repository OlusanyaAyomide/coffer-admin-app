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
