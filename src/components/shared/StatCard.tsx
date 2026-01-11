import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  iconColor?: string;
  className?: string;
}

export function StatCard({ title, value, subValue, icon: Icon, iconColor, className }: StatCardProps) {
  return (
    <Card className={cn("hover:scale-[103%] transition-all duration-300", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", iconColor)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl md:text-3xl font-semibold text-popover-foreground">{value}</div>
        {subValue && (
          <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
        )}
      </CardContent>
    </Card>
  );
}
