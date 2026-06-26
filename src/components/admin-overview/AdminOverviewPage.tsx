import { useNavigate } from '@tanstack/react-router';
import type { SetStateAction } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';

import { OverviewCharts } from '@/components/admin-overview/OverviewCharts';
import { OverviewInsightsCard } from '@/components/admin-overview/OverviewInsightsCard';
import { OverviewProductBreakdown } from '@/components/admin-overview/OverviewProductBreakdown';
import { OverviewRatesRail } from '@/components/admin-overview/OverviewRatesRail';
import { OverviewSkeleton } from '@/components/admin-overview/OverviewSkeleton';
import { OverviewSummaryCards } from '@/components/admin-overview/OverviewSummaryCards';
import {
  OverviewTopCabalsTable,
  type TopCabalSortBy,
  type TopCabalSortOrder,
} from '@/components/admin-overview/OverviewTopCabalsTable';
import { TOP_CABAL_LIMIT } from '@/components/admin-overview/overviewConstants';
import CabalPreviewSheet from '@/components/locker/cabal/CabalPreviewSheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import useAdminOverview from '@/hooks/useAdminOverview';
import type {
  OverviewCurrencyFilter,
  OverviewRange,
} from '@/types/AdminOverviewTypes';
import type { EntryCurrency, GroupSavingStatus } from '@/types/LockerTypes';

export default function AdminOverviewPage() {
  const navigate = useNavigate();
  const [range, setRange] = useState<OverviewRange>('7d');
  const [currency, setCurrency] = useState<OverviewCurrencyFilter>('all');
  const [topCabalsPage, setTopCabalsPage] = useState(1);
  const [topCabalsSearch, setTopCabalsSearch] = useState('');
  const [topCabalsStatus, setTopCabalsStatus] = useState<Array<string>>([]);
  const [topCabalsCurrency, setTopCabalsCurrency] = useState<Array<string>>([]);
  const [topCabalsSortBy, setTopCabalsSortBy] =
    useState<TopCabalSortBy>('total_contributed');
  const [topCabalsOrder, setTopCabalsOrder] =
    useState<TopCabalSortOrder>('desc');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const { overview, isOverviewLoading, isOverviewError } = useAdminOverview({
    range,
    currency,
    top_cabals_page: topCabalsPage,
    top_cabals_limit: TOP_CABAL_LIMIT,
    top_cabals_search: topCabalsSearch || undefined,
    top_cabals_status: topCabalsStatus as Array<GroupSavingStatus>,
    top_cabals_currency: topCabalsCurrency as Array<EntryCurrency>,
    top_cabals_sort_by: topCabalsSortBy,
    top_cabals_order: topCabalsOrder,
  });

  const flowChartData = useMemo(
    () =>
      (overview?.charts.flows ?? []).map((point) => ({
        label: point.label,
        depositsNgn: Number(point.deposits?.NGN ?? 0),
        depositsUsdt: Number(point.deposits?.USDT ?? 0),
        withdrawalsNgn: Number(point.withdrawals?.NGN ?? 0),
        withdrawalsUsdt: Number(point.withdrawals?.USDT ?? 0),
      })),
    [overview?.charts.flows],
  );

  const interestChartData = useMemo(
    () =>
      (overview?.charts.interest ?? []).map((point) => ({
        label: point.label,
        accruedNgn: Number(point.accrued?.NGN ?? 0),
        accruedUsdt: Number(point.accrued?.USDT ?? 0),
        paidNgn: Number(point.paid?.NGN ?? 0),
        paidUsdt: Number(point.paid?.USDT ?? 0),
      })),
    [overview?.charts.interest],
  );

  const handleTopCabalsSearchChange = useCallback((value: string) => {
    setTopCabalsPage(1);
    setTopCabalsSearch(value);
  }, []);

  const handleStatusFiltersChange = useCallback(
    (value: SetStateAction<Array<string>>) => {
      setTopCabalsPage(1);
      setTopCabalsStatus(value);
    },
    [],
  );

  const handleCurrencyFiltersChange = useCallback(
    (value: SetStateAction<Array<string>>) => {
      setTopCabalsPage(1);
      setTopCabalsCurrency(value);
    },
    [],
  );

  const handleTopCabalsSortByChange = useCallback((value: TopCabalSortBy) => {
    setTopCabalsPage(1);
    setTopCabalsSortBy(value);
  }, []);

  const handleTopCabalsOrderChange = useCallback((value: TopCabalSortOrder) => {
    setTopCabalsPage(1);
    setTopCabalsOrder(value);
  }, []);

  const resetTopCabalFilters = useCallback(() => {
    setTopCabalsPage(1);
    setTopCabalsStatus([]);
    setTopCabalsCurrency([]);
  }, []);

  const openCabalPreview = useCallback((cabalId: string) => {
    setPreviewId(cabalId);
    setPreviewOpen(true);
  }, []);

  if (isOverviewError) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-lg font-medium text-foreground">
            Locker overview unavailable
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We could not load the locker overview right now.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-medium text-foreground">Locker Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Balances, flows, rates, interest, and Cabal activity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={range}
            onValueChange={(value) => setRange(value as OverviewRange)}
          >
            <SelectTrigger className="h-10 w-[126px]">
              <CalendarDays className="h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="24h">Last 24h</SelectItem>
              <SelectItem value="7d">Last 7d</SelectItem>
              <SelectItem value="30d">Last 30d</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={currency}
            onValueChange={(value) =>
              setCurrency(value as OverviewCurrencyFilter)
            }
          >
            <SelectTrigger className="h-10 w-[128px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All currency</SelectItem>
              <SelectItem value="NGN">NGN</SelectItem>
              <SelectItem value="USDT">USDT</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isOverviewLoading || !overview ? (
        <OverviewSkeleton />
      ) : (
        <>
          <OverviewSummaryCards overview={overview} />
          <OverviewCharts
            flowChartData={flowChartData}
            interestChartData={interestChartData}
          />
          <OverviewProductBreakdown products={overview.products} />

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <OverviewRatesRail
              rates={overview.rates}
              onEdit={() => navigate({ to: '/locker/rates' })}
            />
            <OverviewInsightsCard insights={overview.insights} />
          </div>

          <OverviewTopCabalsTable
            cabals={overview.top_cabals.cabals}
            meta={overview.top_cabals.meta}
            isLoading={isOverviewLoading}
            search={topCabalsSearch}
            onSearchChange={handleTopCabalsSearchChange}
            statusFilters={topCabalsStatus}
            setStatusFilters={handleStatusFiltersChange}
            currencyFilters={topCabalsCurrency}
            setCurrencyFilters={handleCurrencyFiltersChange}
            sortBy={topCabalsSortBy}
            setSortBy={handleTopCabalsSortByChange}
            sortOrder={topCabalsOrder}
            setSortOrder={handleTopCabalsOrderChange}
            setPage={setTopCabalsPage}
            onResetFilters={resetTopCabalFilters}
            onPreviewCabal={openCabalPreview}
          />

          <CabalPreviewSheet
            cabalId={previewId}
            open={previewOpen}
            onOpenChange={setPreviewOpen}
          />
        </>
      )}
    </div>
  );
}
