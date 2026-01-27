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
import useGetRequest from '@/hooks/useGetRequests';
import { UserActivityLogResponse } from '@/types/UserTypes';

export default function UserActivityLogTab({ userId }: { userId: string }) {

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

  // Build query params
  const { data, isLoading } = useGetRequest<UserActivityLogResponse, any>({
    URL: `/admin/customer/${userId}/activity-logs`,
    queryKey: ['user-activity-logs', userId],
    params: {
      page,
      limit: 10,
      ...(activityType.length > 0 && { activity_type: activityType }),
      ...(dateRange?.duration_start && { duration_start: dateRange.duration_start }),
      ...(dateRange?.duration_end && { duration_end: dateRange.duration_end }),
    },
  });

  const logs = data?.data?.logs || [];
  const meta = data?.data?.paginate || {
    total: 0,
    page: 1,
    limit: 10,
    total_page: 0,
    has_next_page: false,
    has_previous_page: false
  };

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
        data={logs}
        meta={meta}
        setPage={setPage}
        isLoading={isLoading}
      >
        <ActivityLogFilter />
      </CustomizableTable>

      {/* Mobile Cards */}
      <MobileCards
        data={logs}
        columns={activityLogMobileColumns}
        title={getActivityLogMobileTitle}
        action={MobileAction}
        footer={getActivityLogMobileFooter}
        meta={meta}
        setPage={setPage}
        testIdKey="id"
        isLoading={isLoading}
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
