import type { Dispatch, SetStateAction } from 'react';
import { useMemo } from 'react';
import { ImageIcon } from 'lucide-react';

import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import BaseDataTable from '@/components/shared/BaseDataTable';
import FilterButtons from '@/components/shared/FilterButtons';
import { TableSearch } from '@/components/shared/TableSearch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CURRENCY_FILTER_OPTIONS,
  STATUS_FILTER_OPTIONS,
} from '@/components/admin-overview/overviewConstants';
import type { AdminOverviewData, AdminOverviewParams } from '@/types/AdminOverviewTypes';
import type { CabalSummary } from '@/types/LockerTypes';
import {
  CABAL_STATUS_LABELS,
  CONTRIBUTION_FREQUENCY_LABELS,
  cabalStatusBadgeVariant,
  formatCabalDate,
  formatCabalMoney,
  progressToPercent,
} from '@/lib/cabalFormat';

export type TopCabalSortBy = NonNullable<
  AdminOverviewParams['top_cabals_sort_by']
>;
export type TopCabalSortOrder = NonNullable<
  AdminOverviewParams['top_cabals_order']
>;

type OverviewTopCabalsTableProps = {
  cabals: AdminOverviewData['top_cabals']['cabals'];
  meta: AdminOverviewData['top_cabals']['meta'];
  isLoading: boolean;
  search: string;
  onSearchChange: (value: string) => void;
  statusFilters: Array<string>;
  setStatusFilters: Dispatch<SetStateAction<Array<string>>>;
  currencyFilters: Array<string>;
  setCurrencyFilters: Dispatch<SetStateAction<Array<string>>>;
  sortBy: TopCabalSortBy;
  setSortBy: (value: TopCabalSortBy) => void;
  sortOrder: TopCabalSortOrder;
  setSortOrder: (value: TopCabalSortOrder) => void;
  setPage: Dispatch<SetStateAction<number>>;
  onResetFilters: () => void;
  onPreviewCabal: (cabalId: string) => void;
};

export function OverviewTopCabalsTable({
  cabals,
  meta,
  isLoading,
  search,
  onSearchChange,
  statusFilters,
  setStatusFilters,
  currencyFilters,
  setCurrencyFilters,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  setPage,
  onResetFilters,
  onPreviewCabal,
}: OverviewTopCabalsTableProps) {
  const activeFilterCount = statusFilters.length + currencyFilters.length;

  const columns = useMemo<Array<ExtendedColumnDef<CabalSummary>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Cabal',
        meta: { className: 'max-w-[22vw]' },
        cell: ({ row }) => {
          const cabal = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {cabal.image_url ? (
                  <img
                    src={cabal.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {cabal.name}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {cabal.creator?.name ?? 'Unknown creator'}
                </p>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={cabalStatusBadgeVariant(row.original.status)}>
            {CABAL_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'contribution_amount',
        header: 'Contribution',
        cell: ({ row }) => {
          const cabal = row.original;
          return (
            <div className="leading-tight">
              <p className="text-foreground">
                {formatCabalMoney(cabal.contribution_amount, cabal.currency)}
              </p>
              <p className="text-xs text-muted-foreground">
                {CONTRIBUTION_FREQUENCY_LABELS[cabal.contribution_frequency]}
              </p>
            </div>
          );
        },
      },
      {
        accessorKey: 'members',
        header: 'Members',
        cell: ({ row }) => {
          const { stats, max_members } = row.original;
          return (
            <span className="text-foreground">
              {stats.active_members}
              {max_members ? ` / ${max_members}` : ''}
            </span>
          );
        },
      },
      {
        accessorKey: 'total_contributed',
        header: 'Held',
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatCabalMoney(
              row.original.stats.total_contributed,
              row.original.currency,
            )}
          </span>
        ),
      },
      {
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) =>
          row.original.target_amount ? (
            <span className="text-foreground">
              {progressToPercent(row.original.stats.progress_percent).toFixed(0)}%
            </span>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: 'is_featured',
        header: 'Featured',
        cell: ({ row }) =>
          row.original.is_featured ? (
            <Badge variant="secondary">Featured - {row.original.importance}</Badge>
          ) : (
            <span className="text-muted-foreground">-</span>
          ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatCabalDate(row.original.created_at)}
          </span>
        ),
      },
      {
        accessorKey: 'actions',
        header: '',
        meta: { className: 'text-right' },
        cell: ({ row }) => (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreviewCabal(row.original.id)}
          >
            View
          </Button>
        ),
      },
    ],
    [onPreviewCabal],
  );

  return (
    <Card className="rounded-lg">
      <CardHeader className="border-b border-border pb-3">
        <CardTitle className="text-sm font-medium uppercase tracking-wide text-muted-foreground">
          Top Cabal groups
        </CardTitle>
        <CardDescription className="text-xs">
          Filterable Cabal performance table using the same admin table pattern.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <TableSearch
          placeholder="Search cabals by name..."
          searchTerm={search}
          onSearchChange={onSearchChange}
        />

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-primary text-xs text-white">
              {activeFilterCount}
            </span>
          )}
          <FilterButtons
            title="status"
            filterKey="overview_cabal_status"
            activeFilters={statusFilters}
            setActiveFilters={setStatusFilters}
            filterOptions={STATUS_FILTER_OPTIONS}
          />
          <FilterButtons
            title="currency"
            filterKey="overview_cabal_currency"
            activeFilters={currencyFilters}
            setActiveFilters={setCurrencyFilters}
            filterOptions={CURRENCY_FILTER_OPTIONS}
          />
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={onResetFilters}>
              Reset Filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium text-foreground">Sort</span>
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as TopCabalSortBy)}
          >
            <SelectTrigger className="w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="total_contributed">Total contributed</SelectItem>
              <SelectItem value="member_count">Member count</SelectItem>
              <SelectItem value="importance">Importance</SelectItem>
              <SelectItem value="created_at">Created time</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={sortOrder}
            onValueChange={(value) => setSortOrder(value as TopCabalSortOrder)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Descending</SelectItem>
              <SelectItem value="asc">Ascending</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BaseDataTable
          columns={columns}
          data={cabals}
          meta={meta}
          setPage={setPage}
          isLoading={isLoading}
          showOnMobile
        />
      </CardContent>
    </Card>
  );
}
