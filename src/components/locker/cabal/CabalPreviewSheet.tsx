import { useNavigate } from '@tanstack/react-router';
import { ExternalLink, ImageIcon, Pencil } from 'lucide-react';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import {
  CABAL_STATUS_LABELS,
  CONTRIBUTION_FREQUENCY_LABELS,
  cabalStatusBadgeVariant,
  formatCabalDate,
  formatCabalMoney,
  progressToPercent,
} from '@/lib/cabalFormat';
import useAdminCabalDetail from '@/hooks/useAdminCabalDetail';
import CabalFormSheet from '@/components/locker/cabal/CabalFormSheet';

type CabalPreviewSheetProps = {
  cabalId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2.5">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

export default function CabalPreviewSheet({
  cabalId,
  open,
  onOpenChange,
}: CabalPreviewSheetProps) {
  const navigate = useNavigate();
  const { detail, isCabalDetailLoading } = useAdminCabalDetail({
    cabalId: cabalId ?? undefined,
    enabled: open,
  });

  const cabal = detail?.cabal;
  const stats = detail?.stats;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl p-0">
        <div className="h-1.5 w-full shrink-0 bg-yellow-500" />
        <SheetHeader className="flex-row items-start justify-between gap-3 border-b border-border">
          <div className="min-w-0">
            <SheetTitle className="truncate">
              {cabal?.name ?? 'Cabal'}
            </SheetTitle>
            {cabal && (
              <p className="mt-1 truncate text-xs text-muted-foreground">
                {cabal.goal_name ?? '—'}
              </p>
            )}
          </div>
          {cabalId && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 shrink-0"
              onClick={() => {
                onOpenChange(false);
                navigate({
                  to: '/locker/cabals/$cabalId',
                  params: { cabalId },
                });
              }}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View full page
            </Button>
          )}
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          {isCabalDetailLoading || !cabal || !stats ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-16 w-full rounded-lg" />
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Hero */}
              <div className="flex gap-4">
                <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  {cabal.image_url ? (
                    <img
                      src={cabal.image_url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant={cabalStatusBadgeVariant(cabal.status)}>
                      {CABAL_STATUS_LABELS[cabal.status]}
                    </Badge>
                    {cabal.is_featured && (
                      <Badge variant="secondary">Featured</Badge>
                    )}
                    {cabal.category?.name && (
                      <Badge variant="outline">{cabal.category.name}</Badge>
                    )}
                  </div>
                  {cabal.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {cabal.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Progress */}
              {cabal.target_amount && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium text-foreground">
                      {progressToPercent(stats.progress_percent).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={progressToPercent(stats.progress_percent)}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formatCabalMoney(stats.total_contributed, cabal.currency)}{' '}
                    of {formatCabalMoney(cabal.target_amount, cabal.currency)}
                  </p>
                </div>
              )}

              {/* Stats grid */}
              <div className="grid grid-cols-2 gap-3">
                <Stat
                  label="Total contributed"
                  value={formatCabalMoney(
                    stats.total_contributed,
                    cabal.currency,
                  )}
                />
                <Stat
                  label="Interest earned"
                  value={formatCabalMoney(
                    stats.total_interest_earned,
                    cabal.currency,
                  )}
                />
                <Stat
                  label="Active members"
                  value={`${stats.active_members}${
                    cabal.max_members ? ` / ${cabal.max_members}` : ''
                  }`}
                />
                <Stat
                  label="Failed debits"
                  value={String(stats.failed_debit_count)}
                />
              </div>

              {/* Contribution config */}
              <div className="space-y-2 rounded-lg border border-border p-4">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Contribution
                </h4>
                <dl className="space-y-1.5 text-sm">
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Amount</dt>
                    <dd className="font-medium text-foreground">
                      {formatCabalMoney(
                        cabal.contribution_amount,
                        cabal.currency,
                      )}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Frequency</dt>
                    <dd className="font-medium text-foreground">
                      {
                        CONTRIBUTION_FREQUENCY_LABELS[
                          cabal.contribution_frequency
                        ]
                      }
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt className="text-muted-foreground">Ends</dt>
                    <dd className="font-medium text-foreground">
                      {formatCabalDate(cabal.end_date)}
                    </dd>
                  </div>
                </dl>
              </div>

              {/* Creator */}
              {cabal.creator && (
                <div className="space-y-1 rounded-lg border border-border p-4">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Creator
                  </h4>
                  <p className="text-sm font-medium text-foreground">
                    {cabal.creator.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {cabal.creator.email} · {cabal.creator.coffer_id}
                  </p>
                </div>
              )}

              <CabalFormSheet
                cabal={cabal}
                trigger={
                  <Button variant="outline" className="w-full gap-2">
                    <Pencil className="h-3.5 w-3.5" />
                    Edit config
                  </Button>
                }
              />
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
