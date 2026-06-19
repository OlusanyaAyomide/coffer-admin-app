import { cn } from '@/lib/utils';

export interface StatCardProps {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  iconColor?: string;
  /** Color of the thin accent strip on top of the card. */
  accentClassName?: string;
  /** Optional class for the sub-value text (e.g. green for positive growth). */
  subValueClassName?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  subValue,
  icon: Icon,
  iconColor,
  accentClassName = 'bg-primary',
  subValueClassName,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border bg-card shadow-[0px_1px_2px_0px_rgba(13,19,50,0.05)]',
        className,
      )}
    >
      {/* top accent strip */}
      <div className={cn('absolute inset-x-0 top-0 h-1', accentClassName)} />

      <div className="p-5 pt-6">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {title}
          </p>
          <span className="flex size-8 items-center justify-center rounded-lg bg-muted">
            <Icon className={cn('h-4 w-4 text-muted-foreground', iconColor)} />
          </span>
        </div>

        <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
          {value}
        </div>
        {subValue && (
          <p className={cn('mt-1 text-xs text-muted-foreground', subValueClassName)}>
            {subValue}
          </p>
        )}
      </div>
    </div>
  );
}
