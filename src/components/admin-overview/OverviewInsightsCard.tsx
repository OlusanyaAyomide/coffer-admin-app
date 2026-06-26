import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { AdminOverviewInsight } from '@/types/AdminOverviewTypes';

type OverviewInsightsCardProps = {
  insights: Array<AdminOverviewInsight>;
};

export function OverviewInsightsCard({ insights }: OverviewInsightsCardProps) {
  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Key insights
        </CardTitle>
        <CardDescription className="text-xs">
          Operational signals for admins.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight) => (
          <div
            key={insight.title}
            className="rounded-lg border border-border bg-card p-3"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-foreground">
                {insight.title}
              </p>
              <Badge
                variant={
                  insight.tone === 'warning'
                    ? 'outline'
                    : insight.tone === 'success'
                      ? 'success'
                      : 'secondary'
                }
              >
                {insight.value}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {insight.description}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
