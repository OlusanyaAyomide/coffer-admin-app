import { useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { ImageIcon, Star } from 'lucide-react'

import type {
  AdminInvestmentStatus,
  AdminInvestmentSummary,
  InvestmentCurrency,
} from '@/types/InvestmentTypes'
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable'
import BaseDataTable from '@/components/shared/BaseDataTable'
import { TableSearch } from '@/components/shared/TableSearch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatMoney,
  INVESTMENT_STATUS_LABELS,
  investmentStatusBadgeVariant,
} from '@/lib/cofferFormat'
import useAdminInvestments from '@/hooks/useAdminInvestments'

const ITEMS_PER_PAGE = 20

type Props = {
  /** Fixed status filter (e.g. Active Coffers page). Omit for full marketplace. */
  fixedStatus?: AdminInvestmentStatus
  /** Right-aligned slot in the header (e.g. a "New investment" button). */
  action?: React.ReactNode
  showSearch?: boolean
}

export default function InvestmentsTable({
  fixedStatus,
  action,
  showSearch = true,
}: Props) {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const { investments, meta, isInvestmentsLoading } = useAdminInvestments({
    page,
    limit: ITEMS_PER_PAGE,
    search: search || undefined,
    status: fixedStatus,
  })

  const columns = useMemo<Array<ExtendedColumnDef<AdminInvestmentSummary>>>(
    () => [
      {
        accessorKey: 'title',
        header: 'Investment',
        meta: { className: 'max-w-[22vw]' },
        cell: ({ row }) => {
          const inv = row.original
          return (
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
                {inv.tempoary_image_url ? (
                  <img
                    src={inv.tempoary_image_url}
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
                <p className="flex items-center gap-1.5 truncate font-medium text-foreground">
                  {inv.is_featured && (
                    <Star
                      className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400"
                      aria-label="Featured"
                    />
                  )}
                  {inv.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {inv.category?.name ?? 'Uncategorised'}
                </p>
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={investmentStatusBadgeVariant(row.original.status)}>
            {INVESTMENT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'price_per_unit',
        header: 'Per unit',
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatMoney(
              row.original.price_per_unit,
              row.original.currency as InvestmentCurrency,
            )}
          </span>
        ),
      },
      {
        accessorKey: 'units',
        header: 'Units sold',
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.units_sold} / {row.original.total_units}
          </span>
        ),
      },
      {
        accessorKey: 'roi_percentage',
        header: 'Total return',
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.roi_percentage}%
          </span>
        ),
      },
      {
        accessorKey: 'investor_count',
        header: 'Investors',
        cell: ({ row }) => (
          <span className="text-foreground">{row.original.investor_count}</span>
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
            onClick={() =>
              navigate({
                to: '/coffer/$investmentId',
                params: { investmentId: row.original.id },
              })
            }
          >
            View
          </Button>
        ),
      },
    ],
    [navigate],
  )

  return (
    <div className="space-y-4">
      {(showSearch || action) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {showSearch ? (
            <TableSearch
              placeholder="Search investments..."
              searchTerm={search}
              onSearchChange={(value) => {
                setPage(1)
                setSearch(value)
              }}
              className="sm:max-w-sm"
            />
          ) : (
            <span />
          )}
          {action}
        </div>
      )}

      <BaseDataTable
        columns={columns}
        data={investments}
        meta={meta ?? undefined}
        setPage={setPage}
        isLoading={isInvestmentsLoading}
        showOnMobile
      />
    </div>
  )
}
