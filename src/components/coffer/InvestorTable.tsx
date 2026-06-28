import { useMemo, useState } from 'react';

import type { InvestorRow } from '@/types/InvestmentTypes';
import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import BaseDataTable from '@/components/shared/BaseDataTable';
import { Badge } from '@/components/ui/badge';
import {
  formatDate,
  formatMoney,
  USER_INVESTMENT_STATUS_LABELS,
} from '@/lib/cofferFormat';
import useInvestmentInvestors from '@/hooks/useInvestmentInvestors';

export default function InvestorTable({ investmentId }: { investmentId: string }) {
  const [page, setPage] = useState(1);
  const { investors, meta, isInvestorsLoading } = useInvestmentInvestors({
    investmentId,
    page,
  });

  const columns = useMemo<Array<ExtendedColumnDef<InvestorRow>>>(
    () => [
      {
        accessorKey: 'user',
        header: 'Investor',
        meta: { className: 'max-w-[22vw]' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {row.original.user.name ?? 'Unknown'}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.user.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'reference',
        header: 'Reference',
        cell: ({ row }) => (
          <span className="font-mono text-xs text-muted-foreground">
            {row.original.reference}
          </span>
        ),
      },
      {
        accessorKey: 'total_units_purchased',
        header: 'Units',
        cell: ({ row }) => (
          <span className="text-foreground">
            {row.original.total_units_purchased}
          </span>
        ),
      },
      {
        accessorKey: 'total_value',
        header: 'Value',
        cell: ({ row }) => (
          <span className="text-foreground">
            {formatMoney(row.original.total_value, row.original.currency)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant="outline">
            {USER_INVESTMENT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Joined',
        cell: ({ row }) => (
          <span className="text-muted-foreground">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <BaseDataTable
      columns={columns}
      data={investors}
      meta={meta ?? undefined}
      setPage={setPage}
      isLoading={isInvestorsLoading}
      showOnMobile
    />
  );
}
