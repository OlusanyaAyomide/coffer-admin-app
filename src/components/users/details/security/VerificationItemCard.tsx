import { CheckCircle2, Key, Mail, Shield } from 'lucide-react';
import type { VerificationItem } from '@/types/UserTypes';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

interface VerificationItemCardProps {
  item: VerificationItem;
}

const getIcon = (icon: VerificationItem['icon']) => {
  switch (icon) {
    case 'kyc':
      return Shield;
    case 'email':
      return Mail;
    case '2fa':
      return Key;
    default:
      return CheckCircle2;
  }
};

const getIconBgColor = (icon: VerificationItem['icon']) => {
  switch (icon) {
    case 'kyc':
      return 'bg-green-500/10 text-green-500';
    case 'email':
      return 'bg-primary/10 text-primary';
    case '2fa':
      return 'bg-purple-500/10 text-purple-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getStatusColor = (status: VerificationItem['status']) => {
  switch (status) {
    case 'verified':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'enabled':
      return 'bg-primary/10 text-primary';
    case 'pending':
      return 'bg-orange-500/10 text-orange-600 dark:text-orange-400';
    case 'not_verified':
      return 'bg-muted text-muted-foreground';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

const getTierBadgeColor = (tier?: string) => {
  if (!tier) return '';
  if (tier.includes('3')) return 'bg-green-500 text-white';
  if (tier.includes('2')) return 'bg-primary text-white';
  if (tier.includes('1')) return 'bg-orange-500 text-white';
  return 'bg-muted text-foreground';
};

export default function VerificationItemCard({ item }: VerificationItemCardProps) {
  const Icon = getIcon(item.icon);

  return (
    <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
      {/* Icon */}
      <div className={cn('p-3 rounded-lg shrink-0', getIconBgColor(item.icon))}>
        <Icon className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
          {item.tierBadge && (
            <span className={cn(
              'text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full',
              getTierBadgeColor(item.tierBadge)
            )}>
              {item.tierBadge}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
          {item.description}
        </p>
        {item.date && (
          <p className="text-xs text-muted-foreground mt-1">
            {formatDateToReadableShort(item.date)}
          </p>
        )}
      </div>

      {/* Status Badge */}
      <span className={cn(
        'text-xs font-medium px-3 py-1.5 rounded-full capitalize shrink-0',
        getStatusColor(item.status)
      )}>
        {item.statusLabel}
      </span>
    </div>
  );
}
