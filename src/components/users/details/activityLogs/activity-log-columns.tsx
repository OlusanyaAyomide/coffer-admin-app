import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { MobileRow } from '@/components/shared/MobileCards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import { UserActivityLog } from '@/types/UserTypes';

export type ActivityLog = UserActivityLog;

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
export const getActivityTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    log_in: 'Login',
    log_out: 'Logout',
    transfer: 'Transfer',
    swap: 'Swap',
    deposit: 'Deposit',
    withdrawal: 'Withdrawal',
    reset_password: 'Reset Password',
    new_device_sign_in: 'New Device Sign In',
    two_fa_sign_in: '2FA Sign In',
    audit_log: 'Audit Log',
    sign_up: 'Sign Up',
    email_verified: 'Email Verified',
    profile_update: 'Profile Update',
    biometric_login: 'Biometric Login',
    deposit_complete: 'Deposit Complete',
    withdrawal_complete: 'Withdrawal Complete',
    swap_complete: 'Swap Complete',
    two_fa_setup: '2FA Setup',
    investment_purchase: 'Investment Purchase',
    investment_withdrawal: 'Investment Withdrawal',
  };
  return labels[type] || titleCase(type.replace(/_/g, ' '));
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
