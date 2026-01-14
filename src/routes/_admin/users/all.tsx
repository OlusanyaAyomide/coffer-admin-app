'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Download, Filter } from 'lucide-react';

import CustomizableTable from '@/components/shared/CustomizableTable';
import MobileCards from '@/components/shared/MobileCards';
import { TableSearch } from '@/components/shared/TableSearch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import UserListContextProvider from '@/components/users/UserListContextProvider';
import useUserListContext from '@/components/users/useUserListContext';
import UserFilter from '@/components/users/UserFilter';
import UserStatsCards from '@/components/users/UserStatsCards';
import { userColumns, userMobileColumns, getUserMobileTitle, UserMobileAction, getUserMobileFooter } from '@/components/users/user-columns';
import useUserStats from '@/hooks/useUserStats';
import useUserList from '@/hooks/useUserList';

export const Route = createFileRoute('/_admin/users/all')({
  component: AllUsersPage,
});

function TableSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 flex-1" />
        ))}
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-2">
          {Array.from({ length: 6 }).map((_, j) => (
            <Skeleton key={j} className="h-12 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

function UsersPageContent() {
  const {
    page,
    setPage,
    searchTerm,
    setSearchTerm,
    kycStatus,
    accountStatus,
    riskLevel,
    country,
    joinedAt,
  } = useUserListContext();

  // Fetch stats
  const { stats, isStatsLoading } = useUserStats();

  // Fetch users with filters
  const { users, meta, isUsersLoading } = useUserList({
    search_term: searchTerm || undefined,
    kyc_status: kycStatus.length ? kycStatus : undefined,
    account_status: accountStatus.length ? accountStatus : undefined,
    risk_level: riskLevel.length ? riskLevel : undefined,
    country: country.length ? country : undefined,
    joined_at: joinedAt.length ? joinedAt : undefined,
    page,
  });

  const isFilterActive =
    !!searchTerm ||
    !!kycStatus.length ||
    !!accountStatus.length ||
    !!riskLevel.length ||
    !!country.length ||
    !!joinedAt.length;

  const paginationMeta = meta ?? {
    total: 0,
    page,
    limit: 10,
    total_page: 0,
    has_next_page: false,
    has_previous_page: false,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all user accounts
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <UserStatsCards stats={stats} isLoading={isStatsLoading} />

      {/* Search */}
      <TableSearch
        placeholder="Search by name, email, or user ID..."
        onSearchChange={(value) => {
          setPage(1);
          setSearchTerm(value);
        }}
        searchTerm={searchTerm}
      />

      {/* Table */}
      {isUsersLoading ? (
        <TableSkeleton />
      ) : (
        <CustomizableTable
          tableKey="users-table"
          defaultVisibleColumns={[
            'sn', 'avatar', 'full_name', 'email', 'coffer_id', 'kyc_status', 'account_status', 'last_active', 'action'
          ]}
          columns={userColumns}
          data={users}
          meta={paginationMeta}
          setPage={setPage}
        >
          <UserFilter />
        </CustomizableTable>
      )}

      {/* Mobile Cards */}
      {!isUsersLoading && (
        <MobileCards
          data={users}
          columns={userMobileColumns}
          title={getUserMobileTitle}
          action={UserMobileAction}
          footer={getUserMobileFooter}
          meta={paginationMeta}
          setPage={setPage}
          testIdKey="user_id"
        />
      )}

      {/* Empty state */}
      {!isUsersLoading && users.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {isFilterActive
              ? 'No users match your filters. Try adjusting your search criteria.'
              : 'No users found.'}
          </p>
        </div>
      )}
    </div>
  );
}

function AllUsersPage() {
  return (
    <UserListContextProvider>
      <UsersPageContent />
    </UserListContextProvider>
  );
}
