import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { ImageIcon, Plus } from 'lucide-react';

import type {
  CabalSummary,
  ContributionFrequency,
  EntryCurrency,
  GroupSavingStatus,
} from '@/types/LockerTypes';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import BaseDataTable from '@/components/shared/BaseDataTable';
import { TableSearch } from '@/components/shared/TableSearch';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CABAL_STATUS_LABELS,
  CONTRIBUTION_FREQUENCY_LABELS,
  cabalStatusBadgeVariant,
  formatCabalDate,
  formatCabalMoney,
  progressToPercent,
} from '@/lib/cabalFormat';
import useAdminCabals from '@/hooks/useAdminCabals';
import CabalFormSheet from '@/components/locker/cabal/CabalFormSheet';
import CabalPreviewSheet from '@/components/locker/cabal/CabalPreviewSheet';
import FilterButtons from '@/components/shared/FilterButtons';

export const Route = createFileRoute('/_admin/locker/cabals/')({
  component: CabalsPage,
});

type CabalSortBy =
  | 'created_at'
  | 'importance'
  | 'member_count'
  | 'total_contributed';
type FeaturedFilterValue = 'featured' | 'standard';
type CreatedByFilterValue = 'admin_created';

const ITEMS_PER_PAGE = 20;

const STATUSES: Array<GroupSavingStatus> = [
  'pending',
  'active',
  'completed',
  'suspended',
  'closed',
];

const STATUS_FILTER_OPTIONS = STATUSES.map((status) => ({
  label: CABAL_STATUS_LABELS[status],
  value: status,
}));

const CURRENCY_FILTER_OPTIONS: Array<{ label: string; value: EntryCurrency }> = [
  { label: 'NGN', value: 'NGN' },
  { label: 'USDT', value: 'USDT' },
];

const FREQUENCY_FILTER_OPTIONS: Array<{
  label: string;
  value: ContributionFrequency;
}> = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
];

const FEATURED_FILTER_OPTIONS: Array<{
  label: string;
  value: FeaturedFilterValue;
}> = [
  { label: 'Featured', value: 'featured' },
  { label: 'Standard', value: 'standard' },
];

const CREATED_BY_FILTER_OPTIONS: Array<{
  label: string;
  value: CreatedByFilterValue;
}> = [{ label: 'Admin-created', value: 'admin_created' }];

const resetPageOnFilterChange =
  (setPage: Dispatch<SetStateAction<number>>) =>
  (setter: Dispatch<SetStateAction<Array<string>>>) =>
  (value: SetStateAction<Array<string>>) => {
    setPage(1);
    setter(value);
  };

function CabalsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<Array<string>>([]);
  const [currencyFilter, setCurrencyFilter] = useState<Array<string>>([]);
  const [frequencyFilter, setFrequencyFilter] = useState<Array<string>>([]);
  const [featuredFilter, setFeaturedFilter] = useState<Array<string>>([]);
  const [createdByFilter, setCreatedByFilter] = useState<Array<string>>([]);
  const [sortBy, setSortBy] = useState<CabalSortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [previewId, setPreviewId] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const setFilterAndResetPage = resetPageOnFilterChange(setPage);

  const activeFilterCount =
    statusFilter.length +
    currencyFilter.length +
    frequencyFilter.length +
    featuredFilter.length +
    createdByFilter.length;

  const resetFilters = () => {
    setPage(1);
    setStatusFilter([]);
    setCurrencyFilter([]);
    setFrequencyFilter([]);
    setFeaturedFilter([]);
    setCreatedByFilter([]);
  };

  const featuredValues = featuredFilter as Array<FeaturedFilterValue>;
  const isFeaturedFilter =
    featuredValues.length === 1
      ? featuredValues.includes('featured')
      : undefined;

  const { cabals, meta, isCabalsLoading } = useAdminCabals({
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    status: statusFilter as Array<GroupSavingStatus>,
    currency: currencyFilter as Array<EntryCurrency>,
    contribution_frequency:
      frequencyFilter as Array<ContributionFrequency>,
    is_featured: isFeaturedFilter,
    is_company_group: createdByFilter.includes('admin_created')
      ? true
      : undefined,
    sort_by: sortBy,
    order: sortOrder,
  });

  const openPreview = (id: string) => {
    setPreviewId(id);
    setPreviewOpen(true);
  };

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
        accessorKey: 'progress',
        header: 'Progress',
        cell: ({ row }) => {
          const { stats, target_amount } = row.original;
          if (!target_amount) {
            return <span className="text-muted-foreground">—</span>;
          }
          return (
            <span className="text-foreground">
              {progressToPercent(stats.progress_percent).toFixed(0)}%
            </span>
          );
        },
      },
      {
        accessorKey: 'is_featured',
        header: 'Featured',
        cell: ({ row }) =>
          row.original.is_featured ? (
            <Badge variant="secondary">
              Featured · {row.original.importance}
            </Badge>
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
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
            onClick={() => openPreview(row.original.id)}
          >
            View
          </Button>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Cabals</h1>
          <p className="mt-1 text-muted-foreground">
            Manage group savings cabals. View a cabal to inspect members,
            contributions, and activity, or open the full page to manage it.
          </p>
        </div>
        <CabalFormSheet
          onSaved={(id) => {
            if (id) openPreview(id);
          }}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New cabal
            </Button>
          }
        />
      </div>

      {/* Search */}
      <TableSearch
        placeholder="Search cabals by name..."
        searchTerm={search}
        onSearchChange={(value) => {
          setPage(1);
          setSearch(value);
        }}
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 py-2 pt-1">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium text-foreground">Filters</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-primary text-xs text-white">
              {activeFilterCount}
            </span>
          )}
          <FilterButtons
            title="status"
            filterKey="cabal_status"
            activeFilters={statusFilter}
            setActiveFilters={setFilterAndResetPage(setStatusFilter)}
            filterOptions={STATUS_FILTER_OPTIONS}
          />
          <FilterButtons
            title="currency"
            filterKey="cabal_currency"
            activeFilters={currencyFilter}
            setActiveFilters={setFilterAndResetPage(setCurrencyFilter)}
            filterOptions={CURRENCY_FILTER_OPTIONS}
          />
          <FilterButtons
            title="frequency"
            filterKey="cabal_frequency"
            activeFilters={frequencyFilter}
            setActiveFilters={setFilterAndResetPage(setFrequencyFilter)}
            filterOptions={FREQUENCY_FILTER_OPTIONS}
          />
          <FilterButtons
            title="featured"
            filterKey="cabal_featured"
            activeFilters={featuredFilter}
            setActiveFilters={setFilterAndResetPage(setFeaturedFilter)}
            filterOptions={FEATURED_FILTER_OPTIONS}
          />
          <FilterButtons
            title="created by"
            filterKey="cabal_created_by"
            activeFilters={createdByFilter}
            setActiveFilters={setFilterAndResetPage(setCreatedByFilter)}
            filterOptions={CREATED_BY_FILTER_OPTIONS}
          />

          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              Reset Filters
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="text-sm font-medium text-foreground">Sort</span>
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setPage(1);
              setSortBy(v as CabalSortBy);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Order by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Created time</SelectItem>
              <SelectItem value="importance">Importance</SelectItem>
              <SelectItem value="member_count">Member count</SelectItem>
              <SelectItem value="total_contributed">
                Total contributed
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(v) => {
              setPage(1);
              setSortOrder(v as 'asc' | 'desc');
            }}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <BaseDataTable
        columns={columns}
        data={cabals}
        meta={meta ?? undefined}
        setPage={setPage}
        isLoading={isCabalsLoading}
        showOnMobile
      />

      <CabalPreviewSheet
        cabalId={previewId}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
