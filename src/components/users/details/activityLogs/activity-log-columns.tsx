import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { MobileRow } from '@/components/shared/MobileCards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

// Activity Log types
export type ActivityType =
  | 'login'
  | 'logout'
  | 'password_change'
  | 'profile_update'
  | 'kyc_submission'
  | 'transaction'
  | '2fa_enabled'
  | '2fa_disabled'
  | 'device_added'
  | 'device_removed'
  | 'withdrawal_request'
  | 'api_key_created';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  description: string;
  ip_address: string;
  device: string;
  location?: string;
  status: 'success' | 'failed' | 'warning';
  created_at: string;
  metadata?: Record<string, string>;
}

// Status color helper
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

// Activity type display helper
const getActivityTypeLabel = (type: ActivityType): string => {
  const labels: Record<ActivityType, string> = {
    login: 'Login',
    logout: 'Logout',
    password_change: 'Password Change',
    profile_update: 'Profile Update',
    kyc_submission: 'KYC Submission',
    transaction: 'Transaction',
    '2fa_enabled': '2FA Enabled',
    '2fa_disabled': '2FA Disabled',
    device_added: 'Device Added',
    device_removed: 'Device Removed',
    withdrawal_request: 'Withdrawal Request',
    api_key_created: 'API Key Created',
  };
  return labels[type] || type;
};

// Title case helper
const titleCase = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Table columns
export const createActivityLogColumns = (
  onViewDetails: (log: ActivityLog) => void
): Array<ExtendedColumnDef<ActivityLog>> => [
    {
      accessorKey: 'type',
      header: 'Activity Type',
      cell: ({ row }) => (
        <span className="font-medium text-sm">
          {getActivityTypeLabel(row.original.type)}
        </span>
      ),
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-sm text-foreground max-w-[250px] truncate block">
          {row.original.description}
        </span>
      ),
    },
    {
      accessorKey: 'ip_address',
      header: 'IP Address',
      cell: ({ row }) => (
        <span className="font-mono text-xs text-muted-foreground">
          {row.original.ip_address}
        </span>
      ),
    },
    {
      accessorKey: 'device',
      header: 'Device',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground max-w-[150px] truncate block">
          {row.original.device}
        </span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={cn(
            'text-sm font-medium capitalize whitespace-nowrap',
            getStatusColor(row.original.status)
          )}
        >
          {titleCase(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Date & Time',
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap text-sm">
          {formatDateToReadableShort(row.original.created_at)}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      meta: { className: 'w-[80px]' },
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => onViewDetails(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

// Mobile columns
export const activityLogMobileColumns: Array<MobileRow<ActivityLog>> = [
  {
    cell: ({ row }) => (
      <span className={cn('text-xs font-medium capitalize', getStatusColor(row.status))}>
        {titleCase(row.status)}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.ip_address}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateToReadableShort(row.created_at)}
      </span>
    ),
    showBorder: false,
  },
];

// Mobile card title
export const getActivityLogMobileTitle = (row: ActivityLog) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">
        {getActivityTypeLabel(row.type)}
      </span>
      <span className="text-xs text-muted-foreground truncate max-w-[200px]">
        {row.description}
      </span>
    </div>
  );
};

// Mobile card footer
export const getActivityLogMobileFooter = ({ row }: { row: ActivityLog }) => (
  <div className="flex justify-between text-xs">
    <span className="text-muted-foreground truncate max-w-[70%]">
      {row.device}
    </span>
    {row.location && (
      <span className="text-muted-foreground">
        {row.location}
      </span>
    )}
  </div>
);
