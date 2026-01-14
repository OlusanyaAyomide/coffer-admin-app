'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { titleCase } from 'title-case';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { UserData } from '@/types/UserTypes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const getKycStatusColor = (status: string) => {
  switch (status) {
    case 'verified':
      return 'text-green-600 dark:text-green-400';
    case 'pending':
      return 'text-yellow-600 dark:text-yellow-400';
    case 'rejected':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getAccountStatusColor = (status: string) => {
  switch (status) {
    case 'active':
      return 'text-green-600 dark:text-green-400';
    case 'suspended':
      return 'text-red-600 dark:text-red-400';
    default:
      return 'text-gray-600 dark:text-gray-400';
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500/50',
    'bg-green-500/50',
    'bg-purple-500/50',
    'bg-orange-500/50',
    'bg-pink-500/50',
    'bg-teal-500/50',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const userColumns: ExtendedColumnDef<UserData>[] = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    meta: {
      className: 'w-[60px]',
    },
    cell: ({ row }) => {
      const { first_name, last_name } = row.original;
      const initials = getInitials(first_name, last_name);
      const avatarColor = getAvatarColor(first_name);

      return (
        <Avatar className={cn('h-10 w-10', avatarColor)}>
          <AvatarFallback className={cn('text-white font-medium', avatarColor)}>
            {initials}
          </AvatarFallback>
        </Avatar>
      );
    },
  },
  {
    accessorKey: 'full_name',
    header: 'Full Name',
    cell: ({ row }) => {
      const { first_name, last_name } = row.original;
      return (
        <span className="font-medium text-foreground whitespace-nowrap">
          {first_name} {last_name}
        </span>
      );
    },
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">{row.original.email}</span>
    ),
  },
  {
    accessorKey: 'coffer_id',
    header: 'Coffer ID',
    cell: ({ row }) => (
      <span className="text-muted-foreground font-medium uppercase">{row.original.user_id}</span>
    ),
  },
  {
    accessorKey: 'kyc_status',
    header: 'KYC Status',
    cell: ({ row }) => {
      const status = row.original.kyc_status;
      return (
        <span className={cn(
          'text-sm font-medium whitespace-nowrap',
          getKycStatusColor(status)
        )}>
          {titleCase(status.replace('_', ' '))}
        </span>
      );
    },
  },
  {
    accessorKey: 'account_status',
    header: 'Account Status',
    cell: ({ row }) => {
      const status = row.original.account_status;
      return (
        <span className={cn(
          'text-sm font-medium whitespace-nowrap',
          getAccountStatusColor(status)
        )}>
          {titleCase(status)}
        </span>
      );
    },
  },
  {
    accessorKey: 'naira_balance',
    header: 'Naira Balance',
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">
        ₦{row.original.naira_balance.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: 'usdt_balance',
    header: 'USDT Balance',
    cell: ({ row }) => (
      <span className="font-medium whitespace-nowrap">
        ${row.original.usdt_balance.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: 'last_active',
    header: 'Last Active',
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDistanceToNow(new Date(row.original.last_active), { addSuffix: true })}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Joined At',
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {format(new Date(row.original.created_at), 'MMM d, yyyy')}
      </span>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Actions',
    meta: {
      className: 'w-[80px]',
    },
    cell: () => (
      <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
        View
      </Button>
    ),
  },
];

// Mobile columns for MobileCards component
import type { MobileRow } from '@/components/shared/MobileCards';

export const userMobileColumns: MobileRow<UserData>[] = [
  {
    cell: ({ row }) => (
      <span className="text-muted-foreground text-xs">{row.email}</span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className={cn('text-xs font-medium', getKycStatusColor(row.kyc_status))}>
        {titleCase(row.kyc_status.replace('_', ' '))}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className={cn('text-xs font-medium', getAccountStatusColor(row.account_status))}>
        {titleCase(row.account_status)}
      </span>
    ),
    showBorder: false,
  },
];

// Mobile card title component
export const getUserMobileTitle = (row: UserData) => (
  <div className="flex items-center gap-3">
    <Avatar className={cn('h-9 w-9', getAvatarColor(row.first_name))}>
      <AvatarFallback className={cn('text-white text-sm font-medium', getAvatarColor(row.first_name))}>
        {getInitials(row.first_name, row.last_name)}
      </AvatarFallback>
    </Avatar>
    <div className="flex flex-col">
      <span className="font-medium text-foreground">
        {row.first_name} {row.last_name}
      </span>
      <span className="text-xs text-muted-foreground">{row.user_id}</span>
    </div>
  </div>
);

// Mobile card action component
export const UserMobileAction = ({ row: _row }: { row: UserData }) => (
  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
    View
  </Button>
);

// Mobile card footer component
export const getUserMobileFooter = ({ row }: { row: UserData }) => (
  <div className="flex justify-between text-xs text-muted-foreground">
    <span>Joined {format(new Date(row.created_at), 'MMM d, yyyy')}</span>
    <span>Active {formatDistanceToNow(new Date(row.last_active), { addSuffix: true })}</span>
  </div>
);
