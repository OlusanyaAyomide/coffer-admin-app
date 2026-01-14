'use client';

import { createFileRoute } from '@tanstack/react-router';
import { Download, Filter } from 'lucide-react';

import CustomizableTable from '@/components/shared/CustomizableTable';
import { TableSearch } from '@/components/shared/TableSearch';
import { Button } from '@/components/ui/button';
import UserListContextProvider from '@/components/users/UserListContextProvider';
import useUserListContext from '@/components/users/useUserListContext';
import UserFilter from '@/components/users/UserFilter';
import UserStatsCards from '@/components/users/UserStatsCards';
import { userColumns } from '@/components/users/user-columns';
import { mockUsers, mockUserStats } from '@/static/usersMockData';

export const Route = createFileRoute('/_admin/users/all')({
  component: AllUsersPage,
});

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

  // Filter mock data based on filters (for demo purposes)
  const filteredUsers = mockUsers.filter((user) => {
    // Search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        user.first_name.toLowerCase().includes(search) ||
        user.last_name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.user_id.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }

    // KYC status filter
    if (kycStatus.length > 0 && !kycStatus.includes(user.kyc_status)) {
      return false;
    }

    // Account status filter
    if (accountStatus.length > 0 && !accountStatus.includes(user.account_status)) {
      return false;
    }

    // Risk level filter
    if (riskLevel.length > 0 && !riskLevel.includes(user.risk_level)) {
      return false;
    }

    // Country filter
    if (country.length > 0 && !country.includes(user.country_id)) {
      return false;
    }

    return true;
  });

  const isFilterActive =
    !!searchTerm ||
    !!kycStatus.length ||
    !!accountStatus.length ||
    !!riskLevel.length ||
    !!country.length ||
    !!joinedAt.length;

  const limit = 10;
  // Mock meta for pagination
  const meta = {
    total: filteredUsers.length,
    page,
    limit,
    total_page: Math.ceil(filteredUsers.length / limit),
    has_next_page: page < Math.ceil(filteredUsers.length / limit),
    has_previous_page: page > 1,
  };

  // Pagination for mock data
  const paginatedUsers = filteredUsers.slice((page - 1) * limit, page * limit);

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
      <UserStatsCards stats={mockUserStats} />

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
      <CustomizableTable
        tableKey="users-table"
        defaultVisibleColumns={[
          'sn', 'avatar', 'full_name', 'email', 'coffer_id', 'kyc_status', 'account_status', 'last_active', 'action'
        ]}
        columns={userColumns}
        data={paginatedUsers}
        meta={meta}
        setPage={setPage}
      >
        <UserFilter />
      </CustomizableTable>

      {/* Empty state */}
      {filteredUsers.length === 0 && (
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
