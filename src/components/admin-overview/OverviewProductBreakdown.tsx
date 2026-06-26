import { OverviewProductCard } from '@/components/admin-overview/OverviewProductCard';
import type { AdminOverviewData } from '@/types/AdminOverviewTypes';
import { LOCKER_TYPE_THEME } from '@/types/LockerTypes';

type OverviewProductBreakdownProps = {
  products: AdminOverviewData['products'];
};

export function OverviewProductBreakdown({
  products,
}: OverviewProductBreakdownProps) {
  return (
    <div className="grid gap-3 lg:grid-cols-3">
      <OverviewProductCard
        title="Self-Lock"
        product={products.self_lock}
        accentClassName={LOCKER_TYPE_THEME.self_lock.accent}
      />
      <OverviewProductCard
        title="Goal-Lock"
        product={products.goal_lock}
        accentClassName={LOCKER_TYPE_THEME.goal_lock.accent}
      />
      <OverviewProductCard
        title="Cabal"
        product={products.cabal}
        accentClassName={LOCKER_TYPE_THEME.cabal.accent}
      />
    </div>
  );
}
