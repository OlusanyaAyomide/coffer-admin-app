'use client';

import { useState } from 'react';
import {
  activityLogMobileColumns,
  createActivityLogColumns,
  getActivityLogMobileFooter,
  getActivityLogMobileTitle
} from './activity-log-columns';
import ActivityLogFilter from './ActivityLogFilter';
import ActivityLogDetailsDialog from './ActivityLogDetailsDialog';
import useActivityLogContext from './useActivityLogContext';
import type { ActivityLog } from './activity-log-columns';
import { Button } from '@/components/ui/button';
import MobileCards from '@/components/shared/MobileCards';
import CustomizableTable from '@/components/shared/CustomizableTable';
import { convertDateToTimeRange } from '@/services/TimeServices';

// Mock activity log data
const mockActivityLogs: Array<ActivityLog> = [
  {
    id: 'LOG-001',
    type: 'login',
    description: 'User logged in successfully',
    ip_address: '192.168.1.45',
    device: 'Chrome on macOS',
    location: 'Lagos, Nigeria',
    status: 'success',
    created_at: '2026-01-21T09:15:00Z',
    metadata: {
      browser: 'Chrome 120',
      os: 'macOS Sonoma',
    },
  },
  {
    id: 'LOG-002',
    type: 'password_change',
    description: 'Password changed via account settings',
    ip_address: '192.168.1.45',
    device: 'Chrome on macOS',
    location: 'Lagos, Nigeria',
    status: 'success',
    created_at: '2026-01-20T14:30:00Z',
  },
  {
    id: 'LOG-003',
    type: 'kyc_submission',
    description: 'KYC Level 2 documents submitted for review',
    ip_address: '192.168.1.45',
    device: 'Safari on iPhone',
    location: 'Lagos, Nigeria',
    status: 'success',
    created_at: '2026-01-19T16:45:00Z',
    metadata: {
      kyc_level: 'Level 2',
      documents: 'ID Card, Proof of Address',
    },
  },
  {
    id: 'LOG-004',
    type: 'transaction',
    description: 'Withdrawal of ₦500,000 initiated',
    ip_address: '88.21.14.22',
    device: 'Chrome on Windows',
    location: 'Abuja, Nigeria',
    status: 'success',
    created_at: '2026-01-18T11:20:00Z',
    metadata: {
      amount: '₦500,000',
      destination: 'Bank Account',
    },
  },
  {
    id: 'LOG-005',
    type: '2fa_enabled',
    description: 'Two-factor authentication enabled via authenticator app',
    ip_address: '192.168.1.45',
    device: 'Chrome on macOS',
    location: 'Lagos, Nigeria',
    status: 'success',
    created_at: '2026-01-17T08:00:00Z',
    metadata: {
      method: 'Google Authenticator',
    },
  },
  {
    id: 'LOG-006',
    type: 'login',
    description: 'Failed login attempt - incorrect password',
    ip_address: '45.67.89.123',
    device: 'Firefox on Linux',
    location: 'Unknown',
    status: 'failed',
    created_at: '2026-01-16T22:15:00Z',
    metadata: {
      attempts: '3',
      locked: 'No',
    },
  },
  {
    id: 'LOG-007',
    type: 'device_added',
    description: 'New device added to trusted devices',
    ip_address: '192.168.1.45',
    device: 'Safari on iPhone 15 Pro',
    location: 'Lagos, Nigeria',
    status: 'success',
    created_at: '2026-01-15T13:40:00Z',
  },
  {
    id: 'LOG-008',
    type: 'profile_update',
    description: 'Profile phone number updated',
    ip_address: '192.168.1.45',
    device: 'Chrome on macOS',
    location: 'Lagos, Nigeria',
    status: 'success',
    created_at: '2026-01-14T10:00:00Z',
    metadata: {
      field: 'Phone Number',
      old_value: '+234 801 XXX XXXX',
      new_value: '+234 802 XXX XXXX',
    },
  },
  {
    id: 'LOG-009',
    type: 'withdrawal_request',
    description: 'Suspicious withdrawal attempt blocked',
    ip_address: '185.220.101.45',
    device: 'Unknown Browser',
    location: 'Unknown Location',
    status: 'warning',
    created_at: '2026-01-13T04:30:00Z',
    metadata: {
      reason: 'Unusual IP location',
      amount: '$10,000 USDT',
    },
  },
  {
    id: 'LOG-010',
    type: 'logout',
    description: 'User logged out',
    ip_address: '192.168.1.45',
    device: 'Chrome on macOS',
    location: 'Lagos, Nigeria',
    status: 'success',
    created_at: '2026-01-12T18:00:00Z',
  },
];

export default function UserActivityLogTab() {
  const {
    activityType,
    duration,
    page,
    setPage,
  } = useActivityLogContext();

  // Dialog state for log details
  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Convert date filter to range
  const dateRange = duration.length > 0 ? convertDateToTimeRange('duration', duration) : null;

  // Filter data
  const filteredData = mockActivityLogs.filter((log) => {
    // Type filter
    if (activityType.length > 0 && !activityType.includes(log.type)) {
      return false;
    }

    // Date range filter
    if (dateRange) {
      const logDate = new Date(log.created_at);
      if (dateRange.duration_start && logDate < new Date(dateRange.duration_start)) return false;
      if (dateRange.duration_end && logDate > new Date(dateRange.duration_end)) return false;
    }

    return true;
  });

  // Handlers
  const handleViewDetails = (log: ActivityLog) => {
    setSelectedLog(log);
    setIsDetailsOpen(true);
  };

  // Create columns with handlers
  const columns = createActivityLogColumns(handleViewDetails);

  // Mobile action wrapper
  const MobileAction = ({ row }: { row: ActivityLog }) => (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary hover:bg-primary/10"
      onClick={() => handleViewDetails(row)}
    >
      View
    </Button>
  );

  // Pagination meta (mock)
  const paginationMeta = {
    total: filteredData.length,
    page: page,
    limit: 10,
    total_page: Math.ceil(filteredData.length / 10),
    has_next_page: page < Math.ceil(filteredData.length / 10),
    has_previous_page: page > 1,
  };

  return (
    <div className="space-y-6">
      {/* Desktop Table */}
      <CustomizableTable
        tableKey="activity-log-table"
        defaultVisibleColumns={[
          'type',
          'description',
          'ip_address',
          'status',
          'created_at',
          'action',
        ]}
        columns={columns}
        data={filteredData}
        meta={paginationMeta}
        setPage={setPage}
      >
        <ActivityLogFilter />
      </CustomizableTable>

      {/* Mobile Cards */}
      <MobileCards
        data={filteredData}
        columns={activityLogMobileColumns}
        title={getActivityLogMobileTitle}
        action={MobileAction}
        footer={getActivityLogMobileFooter}
        meta={paginationMeta}
        setPage={setPage}
        testIdKey="id"
      />

      {/* Details Dialog */}
      <ActivityLogDetailsDialog
        log={selectedLog}
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />
    </div>
  );
}

