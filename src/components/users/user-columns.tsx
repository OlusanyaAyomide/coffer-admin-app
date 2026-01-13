'use client';

import { format, formatDistanceToNow } from 'date-fns';
import { titleCase } from 'title-case';
import { MoreHorizontal } from 'lucide-react';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { UserData } from '@/types/UserTypes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const getKycStatusStyle = (status: string) => {
  switch (status) {
    case 'verified':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'pending':
      return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
    case 'rejected':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getAccountStatusStyle = (status: string) => {
  switch (status) {
    case 'active':
      return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case 'suspended':
      return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400';
  }
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

const getAvatarColor = (name: string) => {
  const colors = [
    'bg-blue-500/50',
    'bg-green-500',
    'bg-purple-500',
    'bg-orange-500',
    'bg-pink-500',
    'bg-teal-500',
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
      const { first_name, last_name, email } = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">
            {first_name} {last_name}
          </span>
          <span className="text-sm text-muted-foreground">{email}</span>
        </div>
      );
    },
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
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getKycStatusStyle(status)
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
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          getAccountStatusStyle(status)
        )}>
          {titleCase(status)}
        </span>
      );
    },
  },
  {
    accessorKey: 'balance',
    header: 'Balance',
    cell: ({ row }) => (
      <span className="font-medium">
        ${row.original.balance.toLocaleString()}
      </span>
    ),
  },
  {
    accessorKey: 'last_active',
    header: 'Last Active',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {formatDistanceToNow(new Date(row.original.last_active), { addSuffix: true })}
      </span>
    ),
  },
  {
    accessorKey: 'created_at',
    header: 'Joined At',
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {format(new Date(row.original.created_at), 'MMM d, yyyy')}
      </span>
    ),
  },
  {
    accessorKey: 'action',
    header: 'Actions',
    meta: {
      className: 'w-[100px]',
    },
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          View
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit User</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Suspend User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];
