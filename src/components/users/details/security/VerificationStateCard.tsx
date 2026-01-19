import { Clock, Shield } from 'lucide-react';
import VerificationItemCard from './VerificationItemCard';
import type {VerificationItem} from './VerificationItemCard';

interface VerificationStateCardProps {
  items: Array<VerificationItem>;
  syncedAt?: string;
}

export default function VerificationStateCard({ items, syncedAt }: VerificationStateCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-base font-semibold">Verification & Security State</h3>
        </div>
        {syncedAt && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
            <Clock className="h-3 w-3" />
            <span>SYNCED: {syncedAt}</span>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <VerificationItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
