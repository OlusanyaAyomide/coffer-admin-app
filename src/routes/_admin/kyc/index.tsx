'use client';

import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import type { KycStats } from '@/components/kyc/KycStatsCards';
import type {KycSubmission} from '@/components/kyc/kyc-columns';
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

export const Route = createFileRoute('/_admin/kyc/')({
  component: KycManagementPage,
});

// Mock stats data
const mockStats: KycStats = {
  total_kyc: 1248,
  this_week: 87,
  pending_review: 42,
  processed_kyc: 1206,
  approved: 1089,
  rejected: 117,
};

// Mock KYC submissions data
const mockKycSubmissions: Array<KycSubmission> = [
  {
    id: 'KYC-001',
    user_id: 'u-001',
    user_name: 'John Doe',
    user_email: 'john.doe@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=1',
    kyc_band: 'band_b',
    status: 'pending',
    country: 'Nigeria',
    document_type: 'passport',
    submitted_at: '2026-01-21T10:30:00Z',
  },
  {
    id: 'KYC-002',
    user_id: 'u-002',
    user_name: 'Sarah Johnson',
    user_email: 'sarah.j@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=2',
    kyc_band: 'band_a',
    status: 'under_review',
    country: 'United States',
    document_type: 'drivers_license',
    submitted_at: '2026-01-21T09:15:00Z',
    reviewer: 'Admin User',
  },
  {
    id: 'KYC-003',
    user_id: 'u-003',
    user_name: 'Michael Chen',
    user_email: 'michael.chen@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=3',
    kyc_band: 'band_c',
    status: 'approved',
    country: 'Ghana',
    document_type: 'national_id',
    submitted_at: '2026-01-20T16:45:00Z',
    reviewed_at: '2026-01-21T08:00:00Z',
    reviewer: 'Admin User',
  },
  {
    id: 'KYC-004',
    user_id: 'u-004',
    user_name: 'Emily Williams',
    user_email: 'emily.w@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=4',
    kyc_band: 'band_b',
    status: 'rejected',
    country: 'United Kingdom',
    document_type: 'passport',
    submitted_at: '2026-01-20T14:20:00Z',
    reviewed_at: '2026-01-20T18:30:00Z',
    reviewer: 'Admin User',
  },
  {
    id: 'KYC-005',
    user_id: 'u-005',
    user_name: 'Ahmed Hassan',
    user_email: 'ahmed.h@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=5',
    kyc_band: 'band_c',
    status: 'pending',
    country: 'Egypt',
    document_type: 'national_id',
    submitted_at: '2026-01-20T11:00:00Z',
  },
  {
    id: 'KYC-006',
    user_id: 'u-006',
    user_name: 'Lisa Anderson',
    user_email: 'lisa.a@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=6',
    kyc_band: 'band_a',
    status: 'approved',
    country: 'Canada',
    document_type: 'passport',
    submitted_at: '2026-01-19T15:30:00Z',
    reviewed_at: '2026-01-20T09:00:00Z',
    reviewer: 'Admin User',
  },
  {
    id: 'KYC-007',
    user_id: 'u-007',
    user_name: 'David Kim',
    user_email: 'david.kim@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=7',
    kyc_band: 'band_b',
    status: 'under_review',
    country: 'South Korea',
    document_type: 'drivers_license',
    submitted_at: '2026-01-19T13:45:00Z',
    reviewer: 'Admin User',
  },
  {
    id: 'KYC-008',
    user_id: 'u-008',
    user_name: 'Maria Garcia',
    user_email: 'maria.g@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=8',
    kyc_band: 'band_c',
    status: 'pending',
    country: 'Mexico',
    document_type: 'national_id',
    submitted_at: '2026-01-19T10:20:00Z',
  },
  {
    id: 'KYC-009',
    user_id: 'u-009',
    user_name: 'James Brown',
    user_email: 'james.b@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=9',
    kyc_band: 'band_b',
    status: 'approved',
    country: 'Australia',
    document_type: 'passport',
    submitted_at: '2026-01-18T17:00:00Z',
    reviewed_at: '2026-01-19T11:00:00Z',
    reviewer: 'Admin User',
  },
  {
    id: 'KYC-010',
    user_id: 'u-010',
    user_name: 'Fatima Ali',
    user_email: 'fatima.ali@example.com',
    user_avatar: 'https://i.pravatar.cc/150?u=10',
    kyc_band: 'band_a',
    status: 'pending',
    country: 'Nigeria',
    document_type: 'passport',
    submitted_at: '2026-01-18T14:30:00Z',
  },
];

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

  // State for review dialog (placeholder)
  const [_selectedSubmission, setSelectedSubmission] = useState<KycSubmission | null>(null);

  // Convert date filter to range
  const dateRange = duration.length > 0 ? convertDateToTimeRange('duration', duration) : null;

  // Filter data
  const filteredData = mockKycSubmissions.filter((submission) => {
    // Status filter
    if (kycStatus.length > 0 && !kycStatus.includes(submission.status)) {
      return false;
    }

    // Country filter
    if (country.length > 0 && !country.includes(submission.country)) {
      return false;
    }

    // Band filter
    if (kycBand.length > 0 && !kycBand.includes(submission.kyc_band)) {
      return false;
    }

    // Date range filter
    if (dateRange) {
      const submissionDate = new Date(submission.submitted_at);
      if (dateRange.duration_start && submissionDate < new Date(dateRange.duration_start)) return false;
      if (dateRange.duration_end && submissionDate > new Date(dateRange.duration_end)) return false;
    }

    return true;
  });

  // Handlers
  const handleViewDetails = (submission: KycSubmission) => {
    setSelectedSubmission(submission);
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

  // Pagination meta (mock)
  const paginationMeta = {
    total: filteredData.length,
    page: page,
    limit: 10,
    total_page: Math.ceil(filteredData.length / 10),
    has_next_page: page < Math.ceil(filteredData.length / 10),
    has_previous_page: page > 1,
  };

  const isFilterActive = !!kycStatus.length || !!country.length || !!duration.length;

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
        stats={mockStats}
        isLoading={false}
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
          data={filteredData}
          meta={paginationMeta}
          setPage={setPage}
        >
          <KycFilter />
        </CustomizableTable>

        {/* Mobile Cards */}
        <MobileCards
          data={filteredData}
          columns={kycMobileColumns}
          title={getKycMobileTitle}
          action={MobileAction}
          footer={getKycMobileFooter}
          meta={paginationMeta}
          setPage={setPage}
          testIdKey="id"
        />

        {/* Empty state */}
        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {isFilterActive
                ? 'No KYC submissions match your filters. Try adjusting your search criteria.'
                : 'No KYC submissions found.'}
            </p>
          </div>
        )}
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
