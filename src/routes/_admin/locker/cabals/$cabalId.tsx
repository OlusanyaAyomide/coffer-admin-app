'use client';

import { createFileRoute } from '@tanstack/react-router';
import {
  AlertTriangle,
  Coins,
  ImageIcon,
  Pencil,
  TrendingUp,
  Users,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import HeaderNavButton from '@/components/shared/HeaderNavButton';
import {
  CABAL_STATUS_LABELS,
  cabalStatusBadgeVariant,
  formatCabalMoney,
} from '@/lib/cabalFormat';
import { cn } from '@/lib/utils';
import useAdminCabalDetail from '@/hooks/useAdminCabalDetail';
import CabalDetailTabs from '@/components/locker/cabal/CabalDetailTabs';
import CabalFormSheet from '@/components/locker/cabal/CabalFormSheet';
import CabalAdminControls from '@/components/locker/cabal/CabalAdminControls';

export const Route = createFileRoute('/_admin/locker/cabals/$cabalId')({
  component: CabalDetailPage,
});

function CabalDetailPage() {
  const { cabalId } = Route.useParams();
  const { detail, isCabalDetailLoading, isCabalDetailError } =
    useAdminCabalDetail({ cabalId });

  const cabal = detail?.cabal;
  const stats = detail?.stats;

  const statCards = stats
    ? [
        {
          title: 'TOTAL CONTRIBUTED',
          value: formatCabalMoney(stats.total_contributed, cabal?.currency),
          icon: Coins,
          iconColor: 'bg-primary/10 text-primary',
        },
        {
          title: 'INTEREST EARNED',
          value: formatCabalMoney(
            stats.total_interest_earned,
            cabal?.currency,
          ),
          icon: TrendingUp,
          iconColor: 'bg-green-500/10 text-green-500',
        },
        {
          title: 'ACTIVE MEMBERS',
          value: `${stats.active_members}${
            cabal?.max_members ? ` / ${cabal.max_members}` : ''
          }`,
          icon: Users,
          iconColor: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          title: 'FAILED DEBITS',
          value: String(stats.failed_debit_count),
          icon: AlertTriangle,
          iconColor: 'bg-orange-500/10 text-orange-500',
        },
      ]
    : [];

  return (
    <div className="space-y-6 pb-10">
      <HeaderNavButton>
        {cabal && stats && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <CabalAdminControls cabal={cabal} stats={stats} />
            <CabalFormSheet
              cabal={cabal}
              trigger={
                <Button variant="outline" className="gap-2">
                  <Pencil className="h-4 w-4" />
                  Edit config
                </Button>
              }
            />
          </div>
        )}
      </HeaderNavButton>

      {isCabalDetailError ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-foreground">Could not load this cabal.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been removed or the link is invalid.
          </p>
        </div>
      ) : (
        <>
          {/* Header */}
          {isCabalDetailLoading || !cabal ? (
            <div className="flex gap-4">
              <Skeleton className="h-20 w-28 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-64" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
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
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-medium text-foreground">
                    {cabal.name}
                  </h1>
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
                {cabal.goal_name && (
                  <p className="text-muted-foreground">{cabal.goal_name}</p>
                )}
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {isCabalDetailLoading || !stats
              ? [1, 2, 3, 4].map((i) => (
                  <Card key={i} className="overflow-hidden border-border bg-card">
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <Skeleton className="h-3 w-20" />
                        <Skeleton className="h-6 w-6 rounded-md" />
                      </div>
                      <Skeleton className="h-7 w-28" />
                    </CardContent>
                  </Card>
                ))
              : statCards.map((stat, i) => (
                  <Card
                    key={i}
                    className="overflow-hidden border-border bg-card"
                  >
                    <CardContent className="p-5">
                      <div className="mb-4 flex items-start justify-between">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                          {stat.title}
                        </span>
                        <div className={cn('rounded-md p-1.5', stat.iconColor)}>
                          <stat.icon className="h-3.5 w-3.5" />
                        </div>
                      </div>
                      <p className="text-xl font-semibold text-foreground">
                        {stat.value}
                      </p>
                    </CardContent>
                  </Card>
                ))}
          </div>

          {/* Tabs */}
          {!isCabalDetailLoading && detail && (
            <CabalDetailTabs detail={detail} />
          )}
        </>
      )}
    </div>
  );
}
