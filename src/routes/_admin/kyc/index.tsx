'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';

import type { KycStatsResponse, KycSubmission, KycListResponse } from '@/types/UserTypes';
import CustomizableTable from '@/components/shared/CustomizableTable';
import MobileCards from '@/components/shared/MobileCards';
import { Button } from '@/components/ui/button';
import KycListContextProvider from '@/components/kyc/KycListContextProvider';
import useKycListContext from '@/components/kyc/useKycListContext';
import KycFilter from '@/components/kyc/KycFilter';
import KycStatsCards from '@/components/kyc/KycStatsCards';
import {

  createKycColumns,
  getKycMobileFooter,
  getKycMobileTitle,
  kycMobileColumns
} from '@/components/kyc/kyc-columns';
import { convertDateToTimeRange } from '@/services/TimeServices';
import useGetRequest from '@/hooks/useGetRequests';
import { QueryError } from '@/types/ResponseTypes';

export const Route = createFileRoute('/_admin/kyc/')({
  component: KycManagementPage,
});

function KycPageContent() {
  const navigate = useNavigate();
  const {
    page,
    setPage,
    kycStatus,
    kycBand,
    country,
    duration,
  } = useKycListContext();

  // Convert date filter to range
  const dateRange = duration.length > 0 ? convertDateToTimeRange('duration', duration) : null;

  // Build query params
  const rawQueryParams = {
    page,
    limit: 10,
    status: kycStatus,
    kyc_band: kycBand,
    country: country,
    duration_start: dateRange?.duration_start,
    duration_end: dateRange?.duration_end,
  };

  // Remove undefined values and cast to match useGetRequest expectations
  const queryParams = Object.fromEntries(
    Object.entries(rawQueryParams).filter(([_, v]) => v !== undefined && v !== null && v !== '')
  ) as Record<string, string | number | boolean | string[] | number[]>;

  // Fetch Stats
  const { data: statsData, isLoading: isStatsLoading } = useGetRequest<KycStatsResponse, QueryError>({
    URL: '/admin/kyc/stats',
    queryKey: ['kyc-stats'],
  });

  // Fetch List
  const { data: listData, isLoading: isListLoading } = useGetRequest<KycListResponse, QueryError>({
    URL: '/admin/kyc/list',
    queryKey: ['kyc-list'], // Include params in key for refetching
    params: queryParams,
  });

  const kycSubmissions = listData?.data?.data || [];
  const paginationMeta = listData?.data?.meta || {
    total: 0,
    page: 1,
    limit: 10,
    total_page: 1,
    has_next_page: false,
    has_previous_page: false,
  };

  // Handlers
  const handleViewDetails = (submission: KycSubmission) => {
    navigate({ to: '/kyc/$kycId', params: { kycId: submission.id } });
  };

  const handleViewAnalytics = () => {
    // TODO: Navigate to analytics page
    console.log('View KYC Analytics');
  };

  // Create columns with handlers
  const columns = createKycColumns(handleViewDetails);

  // Mobile action wrapper
  const MobileAction = ({ row }: { row: KycSubmission }) => (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary hover:bg-primary/10"
      onClick={() => handleViewDetails(row)}
    >
      Review
    </Button>
  );

  return (
    <div className="space-y-6">

      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-medium text-foreground">KYC Management</h1>
        <p className="text-muted-foreground mt-1">
          Review and manage KYC submissions from users
        </p>
      </div>

      {/* Overview Section - Stats Cards */}
      <KycStatsCards
        stats={statsData?.data || null}
        isLoading={isStatsLoading}
        onViewAnalytics={handleViewAnalytics}
      />

      {/* Table Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">KYC Submissions</h2>

        {/* Desktop Table */}
        <CustomizableTable
          tableKey="kyc-submissions-table"
          defaultVisibleColumns={[
            'user_email',
            'kyc_band',
            'document_type',
            'country',
            'status',
            'submitted_at',
            'action',
          ]}
          columns={columns}
          data={kycSubmissions}
          meta={paginationMeta}
          setPage={setPage}
          isLoading={isListLoading}
        >
          <KycFilter />
        </CustomizableTable>

        {/* Mobile Cards */}
        <MobileCards
          data={kycSubmissions}
          columns={kycMobileColumns}
          title={getKycMobileTitle}
          action={MobileAction}
          footer={getKycMobileFooter}
          meta={paginationMeta}
          setPage={setPage}
          testIdKey="id"
          isLoading={isListLoading}
        />
      </div>
    </div>
  );
}

function KycManagementPage() {
  return (
    <KycListContextProvider>
      <KycPageContent />
    </KycListContextProvider>
  );
}
