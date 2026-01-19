import { ChevronRight } from 'lucide-react';
import type {ExtendedColumnDef} from '@/components/shared/BaseDataTable';
import { Button } from '@/components/ui/button';
import BaseDataTable from '@/components/shared/BaseDataTable';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

export interface SecurityEvent {
  id: string;
  event: string;
  ipAddress: string;
  dateTime: string;
  status: 'success' | 'completed' | 'failed' | 'warning';
}

interface SecurityEventsTableProps {
  events: Array<SecurityEvent>;
  onViewFullLogs?: () => void;
}

const getStatusColor = (status: SecurityEvent['status']) => {
  switch (status) {
    case 'success':
      return 'text-green-600 dark:text-green-400';
    case 'completed':
      return 'text-primary';
    case 'failed':
      return 'text-red-600 dark:text-red-400';
    case 'warning':
      return 'text-orange-600 dark:text-orange-400';
    default:
      return 'text-muted-foreground';
  }
};

const getStatusLabel = (status: SecurityEvent['status']) => {
  switch (status) {
    case 'success':
      return 'Success';
    case 'completed':
      return 'Completed';
    case 'failed':
      return 'Failed';
    case 'warning':
      return 'Warning';
    default:
      return status;
  }
};

// Column definitions for security events table
export const securityEventsColumns: Array<ExtendedColumnDef<SecurityEvent>> = [
  {
    accessorKey: 'event',
    header: 'Event',
    cell: ({ row }) => (
      <span className="font-medium text-sm">{row.original.event}</span>
    ),
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground font-mono">
        {row.original.ipAddress}
      </span>
    ),
  },
  {
    accessorKey: 'dateTime',
    header: 'Date & Time',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDateToReadableShort(row.original.dateTime)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <span className={cn('text-sm font-medium', getStatusColor(row.original.status))}>
        {getStatusLabel(row.original.status)}
      </span>
    ),
  },
];

export default function SecurityEventsTable({ events, onViewFullLogs }: SecurityEventsTableProps) {
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-base font-semibold">Recent Security Events</h3>
        {onViewFullLogs && (
          <Button
            variant="ghost"
            size="sm"
            className="text-primary hover:text-primary hover:bg-transparent gap-1"
            onClick={onViewFullLogs}
          >
            VIEW FULL LOGS
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>

      <BaseDataTable
        columns={securityEventsColumns}
        data={events}
        showOnMobile
      />
    </div>
  );
}
