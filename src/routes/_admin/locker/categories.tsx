import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { ImageIcon, Plus } from 'lucide-react';

import type {
  SavingCategoryType,
  SavingsCategory,
} from '@/types/LockerTypes';
import { CATEGORY_TYPE_LABELS } from '@/types/LockerTypes';
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
import CategoryFormSheet from '@/components/locker/CategoryFormSheet';
import CategoryRowActions from '@/components/locker/CategoryRowActions';
import useLockerCategories from '@/hooks/useLockerCategories';

export const Route = createFileRoute('/_admin/locker/categories')({
  component: CategoriesPage,
});

type StatusFilter = 'all' | 'active' | 'inactive';
type TypeFilter = 'all' | SavingCategoryType;
type CategorySortBy = 'sort_order' | 'created_at' | 'updated_at';
type CategorySortOrder = 'asc' | 'desc';

const ITEMS_PER_PAGE = 20;

function usageCount(category: SavingsCategory): number {
  const c = category._count;
  if (!c) return 0;
  return c.SelfLocks + c.GoalLocks + c.GroupSavings;
}

function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<CategorySortBy>('created_at');
  const [sortOrder, setSortOrder] = useState<CategorySortOrder>('desc');

  const { categories, meta, isCategoriesLoading } = useLockerCategories({
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : typeFilter,
    is_active:
      statusFilter === 'all' ? undefined : statusFilter === 'active',
    sort_by: sortBy,
    order: sortOrder,
  });

  const columns = useMemo<Array<ExtendedColumnDef<SavingsCategory>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        meta: { className: 'max-w-[24vw]' },
        cell: ({ row }) => {
          const category = row.original;
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {category.image_url ? (
                  <img
                    src={category.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                {category.icon_url && (
                  <span className="absolute bottom-1 right-1 flex h-5 w-5 items-center justify-center rounded border border-border bg-card">
                    <img
                      src={category.icon_url}
                      alt=""
                      className="h-3.5 w-3.5 object-contain"
                    />
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium text-foreground">
                  {category.name}
                </p>
                {category.description && (
                  <p className="truncate text-xs text-muted-foreground">
                    {category.description}
                  </p>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'type',
        header: 'Applies to',
        cell: ({ row }) => (
          <Badge variant="outline">
            {CATEGORY_TYPE_LABELS[row.original.type]}
          </Badge>
        ),
      },
      {
        accessorKey: '_count',
        header: 'Usage',
        cell: ({ row }) => {
          const count = usageCount(row.original);
          return (
            <span className="text-foreground">
              {count} {count === 1 ? 'lock' : 'locks'}
            </span>
          );
        },
      },
      {
        accessorKey: 'sort_order',
        header: 'Sort',
        cell: ({ row }) => <span>{row.original.sort_order}</span>,
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) =>
          row.original.is_active ? (
            <Badge variant="success" className="gap-1.5">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Active
            </Badge>
          ) : (
            <Badge variant="outline">Inactive</Badge>
          ),
      },
      {
        accessorKey: 'actions',
        header: '',
        meta: { className: 'text-right' },
        cell: ({ row }) => <CategoryRowActions category={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Categories</h1>
          <p className="text-muted-foreground mt-1">
            Manage the savings categories users tag their locks with. Deactivate
            hides a category from new locks without affecting existing ones.
          </p>
        </div>
        <CategoryFormSheet
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New category
            </Button>
          }
        />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TableSearch
          placeholder="Search categories by name…"
          searchTerm={search}
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          className="sm:max-w-md"
        />

        <div className="flex flex-wrap items-center gap-2">
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setPage(1);
              setTypeFilter(v as TypeFilter);
            }}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              <SelectItem value="self_lock">Self-Lock</SelectItem>
              <SelectItem value="goal_lock">Goal-Lock</SelectItem>
              <SelectItem value="both">Both</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={sortBy}
            onValueChange={(v) => {
              setPage(1);
              setSortBy(v as CategorySortBy);
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
              setSortOrder(v as CategorySortOrder);
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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <BaseDataTable
        columns={columns}
        data={categories}
        meta={meta ?? undefined}
        setPage={setPage}
        isLoading={isCategoriesLoading}
        showOnMobile
      />
    </div>
  );
}
