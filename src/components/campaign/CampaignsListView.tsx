import { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';

import type {
  Campaign,
  CampaignChannel,
  CampaignStatus,
} from '@/types/CampaignTypes';
import {
  CAMPAIGN_SCHEDULE_LABELS,
  CAMPAIGN_STATUS_LABELS,
} from '@/types/CampaignTypes';
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
import CampaignFormSheet from '@/components/campaign/CampaignFormSheet';
import CampaignRowActions from '@/components/campaign/CampaignRowActions';
import useCampaigns from '@/hooks/useCampaigns';

type StatusFilter = 'all' | CampaignStatus;

const ITEMS_PER_PAGE = 20;

const STATUS_BADGE: Record<CampaignStatus, string> = {
  draft: 'bg-muted text-muted-foreground',
  scheduled: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  paused: 'bg-amber-100 text-amber-700',
  completed: 'bg-slate-100 text-slate-600',
  archived: 'bg-slate-100 text-slate-500',
};

function describeAudience(campaign: Campaign): string {
  const a = campaign.audience ?? {};
  if (a.all) return 'All eligible users';
  const parts: Array<string> = [];
  if (a.status?.length) parts.push(`${a.status.length} status`);
  if (a.account_tier?.length) parts.push(`${a.account_tier.length} tier`);
  if (a.completion_status?.length) parts.push(`${a.completion_status.length} stage`);
  if (a.has_investment) parts.push('investors');
  if (a.has_locks) parts.push('lockers');
  if (a.signup_after || a.signup_before) parts.push('signup range');
  return parts.length ? parts.join(', ') : 'All eligible users';
}

function describeSchedule(campaign: Campaign): string {
  const label = CAMPAIGN_SCHEDULE_LABELS[campaign.schedule_kind];
  if (campaign.next_run_at) {
    return `${label} · next ${new Date(campaign.next_run_at).toLocaleString(
      undefined,
      { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' },
    )}`;
  }
  return label;
}

type CampaignsListViewProps = {
  channel: CampaignChannel;
  title: string;
  description: string;
};

export default function CampaignsListView({
  channel,
  title,
  description,
}: CampaignsListViewProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const { campaigns, meta, isCampaignsLoading } = useCampaigns({
    page,
    limit: ITEMS_PER_PAGE,
    channel,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  });

  const columns = useMemo<Array<ExtendedColumnDef<Campaign>>>(
    () => [
      {
        accessorKey: 'name',
        header: 'Campaign',
        meta: { className: 'max-w-[22vw]' },
        cell: ({ row }) => (
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {row.original.name}
            </p>
            {row.original.description && (
              <p className="truncate text-xs text-muted-foreground">
                {row.original.description}
              </p>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'audience',
        header: 'Audience',
        cell: ({ row }) => (
          <span className="text-sm text-foreground">
            {describeAudience(row.original)}
          </span>
        ),
      },
      {
        accessorKey: 'schedule_kind',
        header: 'Schedule',
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {describeSchedule(row.original)}
          </span>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={STATUS_BADGE[row.original.status]} variant="outline">
            {CAMPAIGN_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        accessorKey: 'actions',
        header: '',
        meta: { className: 'text-right' },
        cell: ({ row }) => <CampaignRowActions campaign={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-medium text-foreground">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        <CampaignFormSheet
          defaultChannel={channel}
          trigger={
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New campaign
            </Button>
          }
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TableSearch
          placeholder="Search campaigns by name…"
          searchTerm={search}
          onSearchChange={(value) => {
            setPage(1);
            setSearch(value);
          }}
          className="sm:max-w-md"
        />

        <Select
          value={statusFilter}
          onValueChange={(v) => {
            setPage(1);
            setStatusFilter(v as StatusFilter);
          }}
        >
          <SelectTrigger className="w-[170px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(CAMPAIGN_STATUS_LABELS) as Array<CampaignStatus>).map(
              (s) => (
                <SelectItem key={s} value={s}>
                  {CAMPAIGN_STATUS_LABELS[s]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <BaseDataTable
        columns={columns}
        data={campaigns}
        meta={meta ?? undefined}
        setPage={setPage}
        isLoading={isCampaignsLoading}
        showOnMobile
      />
    </div>
  );
}
