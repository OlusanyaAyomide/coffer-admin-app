'use client';

import { useState } from 'react';
import {
  cofferMobileColumns,
  createCofferColumns,
  getCofferMobileFooter,
  getCofferMobileTitle
} from './coffer-columns';
import TransactionTimelineDialog from './TransactionTimelineDialog';
import InvestmentDetailsDialog from './InvestmentDetailsDialog';
import CofferFilter from './CofferFilter';
import CofferTransactionsOverview from './CofferTransactionsOverview';
import UpcomingDividendsSection from './UpcomingDividendsSection';
import useCofferPlansContext from './useCofferPlansContext';
import type { UserInvestmentData, UserInvestmentResponse } from '@/types/InvestmentTypes';
import { Button } from '@/components/ui/button';
import MobileCards from '@/components/shared/MobileCards';
import CustomizableTable from '@/components/shared/CustomizableTable';
import { convertDateToTimeRange } from '@/services/TimeServices';
import useGetRequest from '@/hooks/useGetRequests';
import { Skeleton } from '@/components/ui/skeleton';

interface CofferPlansTabProps {
  userId: string;
}

export default function CofferPlansTab({ userId }: CofferPlansTabProps) {
  const {
    investmentStatus,
    startDate,
    page,
    setPage,
  } = useCofferPlansContext();

  const [selectedInvestmentId, setSelectedInvestmentId] = useState<string | null>(null);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const dateRange = startDate.length > 0 ? convertDateToTimeRange('start_date', startDate) : null;

  const params: Record<string, string | number | boolean | Array<string> | Array<number>> = { page, limit: 20 };
  if (investmentStatus.length > 0) params.status = investmentStatus;
  if (dateRange?.start_date_start) params.start_date_start = dateRange.start_date_start;
  if (dateRange?.start_date_end) params.start_date_end = dateRange.start_date_end;

  const { data, isLoading, isError } = useGetRequest<UserInvestmentResponse, Error>({
    URL: `/admin/customer/${userId}/investments`,
    queryKey: ['user-investments', userId],
    params,
  });

  const handleViewInvestment = (investment: UserInvestmentData) => {
    setSelectedInvestmentId(investment.id);
    setIsDetailsOpen(true);
  };

  const handleViewTransactions = (investment: UserInvestmentData) => {
    setSelectedInvestmentId(investment.id);
    setIsTimelineOpen(true);
  };

  const columns = createCofferColumns(handleViewInvestment, handleViewTransactions);

  const MobileAction = ({ row }: { row: UserInvestmentData }) => (
    <Button
      variant="ghost"
      size="sm"
      className="text-primary hover:text-primary hover:bg-primary/10"
      onClick={() => handleViewTransactions(row)}
    >
      View
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (isError || !data?.data) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        Failed to load investments. Please try again.
      </div>
    );
  }

  const investments = data.data.investments;
  const paginationMeta = data.data.meta;

  return (
    <div className="space-y-6">
      <CustomizableTable
        tableKey="coffer-plans-table"
        defaultVisibleColumns={[
          'sn',
          'investment_name',
          'status',
          'units_owned',
          'total_value',
          'roi',
          'maturity_date',
          'action',
        ]}
        columns={columns}
        data={investments}
        meta={paginationMeta}
        setPage={setPage}
      >
        <CofferFilter />
      </CustomizableTable>

      <MobileCards
        data={investments}
        columns={cofferMobileColumns}
        title={getCofferMobileTitle}
        action={MobileAction}
        footer={getCofferMobileFooter}
        meta={paginationMeta}
        setPage={setPage}
        testIdKey="id"
      />

      <CofferTransactionsOverview userId={userId} />

      <UpcomingDividendsSection userId={userId} />

      <TransactionTimelineDialog
        open={isTimelineOpen}
        onOpenChange={setIsTimelineOpen}
        userId={userId}
        investmentId={selectedInvestmentId}
      />

      <InvestmentDetailsDialog
        open={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        userId={userId}
        investmentId={selectedInvestmentId}
      />
    </div>
  );
}
