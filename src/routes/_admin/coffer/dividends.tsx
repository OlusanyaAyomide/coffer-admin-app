import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useState } from 'react'

import type { AdminDividendRow } from '@/types/InvestmentTypes'
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable'
import BaseDataTable from '@/components/shared/BaseDataTable'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DIVIDEND_TYPE_LABELS, formatDate } from '@/lib/cofferFormat'
import useInvestmentDividends from '@/hooks/useInvestmentDividends'

export const Route = createFileRoute('/_admin/coffer/dividends')({
  component: DividendDeskPage,
})

type ProcessedFilter = 'all' | 'processed' | 'pending'

function DividendDeskPage() {
  const [page, setPage] = useState(1)
  const [processed, setProcessed] = useState<ProcessedFilter>('all')

  const { dividends, meta, isDividendsLoading } = useInvestmentDividends({
    page,
    is_processed: processed === 'all' ? undefined : processed === 'processed',
  })

  const columns = useMemo<Array<ExtendedColumnDef<AdminDividendRow>>>(
    () => [
      {
        accessorKey: 'investment',
        header: 'Investment',
        meta: { className: 'max-w-[22vw]' },
        cell: ({ row }) => (
          <span className="font-medium text-foreground">
            {row.original.investment.title}
          </span>
        ),
      },
      {
        accessorKey: 'type',
        header: 'Type',
        cell: ({ row }) => (
          <span className="text-foreground">
            {DIVIDEND_TYPE_LABELS[row.original.type]}
          </span>
        ),
      },
      {
        accessorKey: 'percentage_of_return',
        header: '% of interest',
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.type === 'capital_payout'
              ? 'Principal'
              : `${Number(row.original.percentage_of_return.toFixed(2))}%`}
          </span>
        ),
      },
      {
        accessorKey: 'payment_date',
        header: 'Payment date',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.payment_date)}
          </span>
        ),
      },
      {
        accessorKey: 'is_processed',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_processed ? 'default' : 'outline'}>
            {row.original.is_processed ? 'Processed' : 'Pending'}
          </Badge>
        ),
      },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-medium text-foreground">Dividend Desk</h1>
        <p className="text-muted-foreground">
          Every scheduled dividend and capital payout across investments.
          Payouts are processed automatically on their payment date.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-foreground">Status</span>
        <Select
          value={processed}
          onValueChange={(v) => {
            setPage(1)
            setProcessed(v as ProcessedFilter)
          }}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processed">Processed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <BaseDataTable
        columns={columns}
        data={dividends}
        meta={meta ?? undefined}
        setPage={setPage}
        isLoading={isDividendsLoading}
        showOnMobile
      />
    </div>
  )
}
