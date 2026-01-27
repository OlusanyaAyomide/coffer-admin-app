import { Check, Copy, X } from 'lucide-react';
import { useState } from 'react';
import { getActivityTypeLabel } from './activity-log-columns';
import type { ActivityLog } from './activity-log-columns';
import {
  AlertDialog,
  AlertDialogContent,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDateToReadableShort } from '@/services/TimeServices';

interface ActivityLogDetailsDialogProps {
  log: ActivityLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ActivityLogDetailsDialog({
  log,
  open,
  onOpenChange,
}: ActivityLogDetailsDialogProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!log) return null;

  const handleCopy = (value: string, field: string) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'failed':
        return 'text-red-600 dark:text-red-400';
      case 'warning':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-muted-foreground';
    }
  };

  const DetailRow = ({
    label,
    value,
    copyable = false,
    className = '',
  }: {
    label: string;
    value: string;
    copyable?: boolean;
    className?: string;
  }) => (
    <div className="flex justify-between items-start py-2 border-b border-border last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium text-right ${className}`}>{value}</span>
        {copyable && (
          <button
            onClick={() => handleCopy(value, label)}
            className="p-1 hover:bg-muted rounded transition-colors"
          >
            {copiedField === label ? (
              <Check className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <Copy className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Activity Log Details</h3>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1">
          <DetailRow label="Activity ID" value={log.id} copyable />
          <DetailRow label="Type" value={getActivityTypeLabel(log.type)} />
          <DetailRow label="Description" value={log.description} />
          <DetailRow label="IP Address" value={log.ip_address} copyable />
          <DetailRow label="Device" value={log.device} />
          {log.location && <DetailRow label="Location" value={log.location} />}
          <DetailRow
            label="Status"
            value={log.status.charAt(0).toUpperCase() + log.status.slice(1)}
            className={getStatusColor(log.status)}
          />
          <DetailRow label="Date & Time" value={formatDateToReadableShort(log.created_at)} />
        </div>

        {log.metadata && typeof log.metadata === 'object' && Object.keys(log.metadata).length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-semibold mb-2">Additional Details</h4>
            <div className="rounded-lg border border-border p-3 bg-muted/30">
              {Object.entries(log.metadata).map(([key, value]) => (
                <div key={key} className="flex justify-between py-1.5 text-sm">
                  <span className="text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
                  <span className="font-medium">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
