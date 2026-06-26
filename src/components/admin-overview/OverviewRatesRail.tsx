import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LOCKER_TYPES } from '@/components/admin-overview/overviewConstants';
import type { ActiveRateEntry } from '@/types/LockerTypes';
import { LOCKER_TYPE_LABELS } from '@/types/LockerTypes';

type OverviewRatesRailProps = {
  rates: Array<ActiveRateEntry>;
  onEdit: () => void;
};

export function OverviewRatesRail({ rates, onEdit }: OverviewRatesRailProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
              Current rates
            </CardTitle>
            <CardDescription className="text-xs">
              Annual rates used by Locker products.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            Edit
          </Button>
        </div>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-3">
        {LOCKER_TYPES.map((type) => {
          const entry = rates.find((rate) => rate.type === type);
          return (
            <div
              key={type}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  {LOCKER_TYPE_LABELS[type]}
                </p>
                {entry?.rate ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="outline">Not set</Badge>
                )}
              </div>
              <p className="mt-3 text-xl font-semibold text-foreground">
                {entry?.rate ? `${entry.rate.base_rate}%` : '-'}
              </p>
              <p className="text-xs text-muted-foreground">
                {entry?.rate ? `${entry.rate.daily_rate}% daily` : 'No active rate'}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
