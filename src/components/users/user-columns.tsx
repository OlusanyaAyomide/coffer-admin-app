'use client';

import { formatDistanceToNow } from 'date-fns';
import { titleCase } from 'title-case';
import TransitionLink from '../layout/TransitionLink';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { UserData } from '@/types/UserTypes';
import type { MobileRow } from '@/components/shared/MobileCards';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import handleOptionalData, { returnDataOrNull } from '@/services/emptyDataServices';
import { formatDateToReadableShort } from '@/services/TimeServices';

// Mobile columns for MobileCards component

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
    'bg-primary/50',
    'bg-green-500/50',
    'bg-purple-500/50',
    'bg-orange-500/50',
    'bg-pink-500/50',
    'bg-teal-500/50',
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

export const userColumns: Array<ExtendedColumnDef<UserData>> = [
  {
    accessorKey: 'avatar',
    header: 'Avatar',
    meta: {
      className: 'w-[60px]',
    },
    cell: ({ row }) => {
      const firstName = handleOptionalData(row.original.first_name);
      const lastName = handleOptionalData(row.original.last_name);
      const initials = getInitials(String(firstName), String(lastName));
      const avatarColor = getAvatarColor(String(firstName));

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
      const firstName = handleOptionalData(row.original.first_name);
      const lastName = handleOptionalData(row.original.last_name);
      return (
        <span className="font-medium text-foreground whitespace-nowrap">
          {firstName} {lastName}
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
      <span className="text-muted-foreground font-medium">{row.original.user_id}</span>
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
    cell: ({ row }) => {
      const balance = Number(row.original.naira_balance ?? 0);
      return (
        <span className="font-medium whitespace-nowrap">
          ₦{balance.toFixed(3)}
        </span>
      );
    },
  },
  {
    accessorKey: 'usdt_balance',
    header: 'USDT Balance',
    cell: ({ row }) => {
      const balance = Number(row.original.usdt_balance ?? 0);
      return (
        <span className="font-medium whitespace-nowrap">
          ${balance.toFixed(3)}
        </span>
      );
    },
  },
  {
    accessorKey: 'last_active',
    header: 'Last Active',
    cell: ({ row }) => {
      const lastActive = returnDataOrNull(row.original.last_active);
      return (
        <span className="text-muted-foreground whitespace-nowrap">
          {lastActive ? formatDistanceToNow(new Date(lastActive), { addSuffix: true }) : 'N/A'}
        </span>
      );
    },
  },
  {
    accessorKey: 'created_at',
    header: 'Joined At',
    cell: ({ row }) => (
      <span className="text-muted-foreground whitespace-nowrap">
        {formatDateToReadableShort(row.original.created_at)}
      </span>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Actions',
    meta: {
      className: 'w-[80px]',
    },
    cell: ({ row }) => (
      <TransitionLink
        to={`/users/${row.original.id}`}>
        <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
          View
        </Button>
      </TransitionLink>
    ),
  },
];

export const userMobileColumns: Array<MobileRow<UserData>> = [
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
export const getUserMobileTitle = (row: UserData) => {
  const firstName = handleOptionalData(row.first_name);
  const lastName = handleOptionalData(row.last_name);

  return (
    <div className="flex items-center gap-3">
      <Avatar className={cn('h-9 w-9', getAvatarColor(String(firstName)))}>
        <AvatarFallback className={cn('text-white text-sm font-medium', getAvatarColor(String(firstName)))}>
          {getInitials(String(firstName), String(lastName))}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="font-medium text-foreground">
          {firstName} {lastName}
        </span>
        <span className="text-xs text-muted-foreground">{row.user_id}</span>
      </div>
    </div>
  );
};

// Mobile card action component
export const UserMobileAction = ({ row: _row }: { row: UserData }) => (
  <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10">
    View
  </Button>
);

// Mobile card footer component
export const getUserMobileFooter = ({ row }: { row: UserData }) => {
  const lastActive = returnDataOrNull(row.last_active);

  return (
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>Joined {formatDateToReadableShort(row.created_at)}</span>
      <span>Active {lastActive ? formatDistanceToNow(new Date(lastActive), { addSuffix: true }) : 'N/A'}</span>
    </div>
  );
};
