import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ImageIcon, Plus } from 'lucide-react';

import type { Banner, BannerStatus } from '@/types/BannerTypes';
import { BANNER_LINK_TYPE_LABELS } from '@/types/BannerTypes';
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
import BannerFormSheet from '@/components/banner/BannerFormSheet';
import BannerRowActions from '@/components/banner/BannerRowActions';
import useBanners from '@/hooks/useBanners';

export const Route = createFileRoute('/_admin/communication/banners')({
  component: BannersPage,
});

type StatusFilter = 'all' | BannerStatus;
type BannerSortBy = 'sort_order' | 'created_at' | 'updated_at';
type BannerSortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

function formatSchedule(banner: Banner): string {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  if (!banner.start_at && !banner.end_at) return 'Always';
  if (banner.start_at && banner.end_at)
    return `${fmt(banner.start_at)} – ${fmt(banner.end_at)}`;
  if (banner.start_at) return `From ${fmt(banner.start_at)}`;
  return `Until ${fmt(banner.end_at as string)}`;
}

function BannersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<BannerSortBy>('sort_order');
  const [sortOrder, setSortOrder] = useState<BannerSortOrder>('asc');

  const { banners, meta, isBannersLoading } = useBanners({
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    sort_by: sortBy,
    order: sortOrder,
  });

  const columns = useMemo<Array<ExtendedColumnDef<Banner>>>(
    () => [
      {
        accessorKey: 'title',
        header: 'Banner',
        meta: { className: 'max-w-[24vw]' },
        cell: ({ row }) => {
          const banner = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="h-12 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
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
                <p className="truncate font-medium text-foreground">{banner.title}</p>
                {banner.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {banner.description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'link_type',
        header: 'Link',
        cell: ({ row }) => (
          <Badge variant="outline">
            {BANNER_LINK_TYPE_LABELS[row.original.link_type]}
          </Badge>
        ),
      },
      {
        accessorKey: 'schedule',
        header: 'Schedule',
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {formatSchedule(row.original)}
          </span>
        ),
      },
      {
        accessorKey: 'sort_order',
        header: 'Sort',
        cell: ({ row }) => <span>{row.original.sort_order}</span>,
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) =>
          row.original.status === 'published' ? (
            <Badge variant="success" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Published
            </Badge>
          ) : (
            <Badge variant="outline">Draft</Badge>
          ),
      },
      {
        accessorKey: 'actions',
        header: '',
        meta: { className: 'text-right' },
        cell: ({ row }) => <BannerRowActions banner={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Banners</h1>
          <p className="text-muted-foreground mt-1">
            Manage the promotional banners in the mobile home carousel. Only
            published banners inside their schedule are shown; drag order is set
            with sort order (lower appears first).
          </p>
        </div>
        <BannerFormSheet
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New banner
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TableSearch
          placeholder="Search banners by title…"
          searchTerm={search}
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          className="sm:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={sortBy}
            onValueChange={(v) => {
              setPage(1);
              setSortBy(v as BannerSortBy);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Order by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sort_order">Sort order</SelectItem>
              <SelectItem value="created_at">Created time</SelectItem>
              <SelectItem value="updated_at">Updated time</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortOrder}
            onValueChange={(v) => {
              setPage(1);
              setSortOrder(v as BannerSortOrder);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Direction" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Ascending</SelectItem>
              <SelectItem value="desc">Descending</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setPage(1);
              setStatusFilter(v as StatusFilter);
            }}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <BaseDataTable
        columns={columns}
        data={banners}
        meta={meta ?? undefined}
        setPage={setPage}
        isLoading={isBannersLoading}
        showOnMobile
      />
    </div>
  );
}
