import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Pencil } from 'lucide-react';

import type { LockerType } from '@/types/LockerTypes';
import { LOCKER_TYPE_LABELS, LOCKER_TYPE_THEME } from '@/types/LockerTypes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import UpdateRateDialog from '@/components/locker/UpdateRateDialog';
import useLockerRates from '@/hooks/useLockerRates';
import useLockerRateHistory from '@/hooks/useLockerRateHistory';
import { formatDateToReadableShort } from '@/services/TimeServices';

export const Route = createFileRoute('/_admin/locker/rates')({
  component: RateManagerPage,
});

const LOCKER_TYPES: Array<LockerType> = ['self_lock', 'goal_lock', 'cabal'];

/**
 * Change history for a single locker type. Owns its own pagination so each tab
 * paginates independently. Only the active tab's content is mounted, so this
 * fetches one product at a time.
 */
function RateHistoryTable({ type }: { type: LockerType }) {
  const [page, setPage] = useState(1);
  const { history, meta, isHistoryLoading } = useLockerRateHistory({ type, page });

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rate</TableHead>
              <TableHead>Effective from</TableHead>
              <TableHead>Effective to</TableHead>
              <TableHead>Changed by</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isHistoryLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : history.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No rate changes recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              history.map((row) => (
                <TableRow key={row.id}>
                  <TableCell className="font-medium">
                    {row.base_rate}%
                    {row.is_active && (
                      <Badge variant="outline" className="ml-2">
                        Active
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDateToReadableShort(row.effective_from)}</TableCell>
                  <TableCell>
                    {row.effective_to
                      ? formatDateToReadableShort(row.effective_to)
                      : '—'}
                  </TableCell>
                  <TableCell>{row.created_by?.name || '—'}</TableCell>
                  <TableCell className="max-w-[240px] truncate" title={row.note ?? ''}>
                    {row.note || '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.total_page > 1 && (
        <div className="flex items-center justify-end gap-2">
          <span className="text-sm text-muted-foreground">
            Page {meta.page} of {meta.total_page}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.has_previous_page}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={!meta.has_next_page}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

function RateManagerPage() {
  const { rates, isRatesLoading } = useLockerRates();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-medium text-foreground">Rate Manager</h1>
        <p className="text-muted-foreground mt-1">
          Configure the annual interest rate for each savings product. Every
          change is versioned and tracked below.
        </p>
      </div>

      {/* Active rate cards — one per product, each in its brand color */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LOCKER_TYPES.map((type) => {
          const entry = rates.find((r) => r.type === type);
          const rate = entry?.rate ?? null;
          const theme = LOCKER_TYPE_THEME[type];

          return (
            <div
              key={type}
              className="relative overflow-hidden rounded-xl border border-border bg-card shadow-[0px_1px_2px_0px_rgba(13,19,50,0.05)]"
            >
              {/* brand accent strip */}
              <div className={cn('absolute inset-x-0 top-0 h-1', theme.accent)} />

              <div className="p-6 pt-7">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-muted-foreground">
                    {LOCKER_TYPE_LABELS[type]}
                  </p>
                  {rate ? (
                    <Badge variant="success" className="gap-1.5">
                      <span className="size-1.5 rounded-full bg-emerald-500" />
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="outline">Not set</Badge>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between gap-3">
                  {isRatesLoading ? (
                    <Skeleton className="h-9 w-24" />
                  ) : (
                    <p className="text-3xl font-semibold tracking-tight text-foreground">
                      {rate ? `${rate.base_rate}%` : '—'}
                      {rate && (
                        <span className="text-sm font-normal text-muted-foreground">
                          {' '}
                          / year
                        </span>
                      )}
                    </p>
                  )}

                  <UpdateRateDialog
                    type={type}
                    currentRate={rate}
                    trigger={
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="shrink-0"
                        aria-label={`Edit ${LOCKER_TYPE_LABELS[type]} rate`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                </div>

                {rate && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    ≈ {rate.daily_rate}% / day · Since{' '}
                    {formatDateToReadableShort(rate.effective_from)}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Change history — one tab per product */}
      <div className="space-y-4">
        <h2 className="text-lg font-medium">Change history</h2>

        <Tabs defaultValue="self_lock" className="w-full space-y-4">
          <TabsList className="w-max min-w-full justify-start border-b border-border bg-transparent p-0 h-auto rounded-none gap-6 flex-nowrap">
            {LOCKER_TYPES.map((type) => (
              <TabsTrigger
                key={type}
                value={type}
                className="rounded-none border-b-2 border-transparent px-1 py-3 font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent shadow-none transition-colors hover:text-foreground"
              >
                {LOCKER_TYPE_LABELS[type]}
              </TabsTrigger>
            ))}
          </TabsList>

          {LOCKER_TYPES.map((type) => (
            <TabsContent key={type} value={type} className="mt-4">
              <RateHistoryTable type={type} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}
