import { useState } from 'react';
import type { ReactNode } from 'react';

import type { Campaign } from '@/types/CampaignTypes';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import useCampaignRuns from '@/hooks/useCampaignRuns';

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function CampaignRunsSheet({
  campaign,
  trigger,
}: {
  campaign: Campaign;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { runs, isRunsLoading } = useCampaignRuns({
    campaignId: campaign.id,
    enabled: open,
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0">
        <div className="h-1.5 w-full shrink-0 bg-brand" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>Runs — {campaign.name}</SheetTitle>
          <SheetDescription>
            Each dispatch of this campaign, with per-run delivery counters.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isRunsLoading ? (
            <p className="text-sm text-muted-foreground">Loading runs…</p>
          ) : runs.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No runs yet. Send the campaign or wait for its schedule.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Started</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Matched</TableHead>
                  <TableHead className="text-right">Queued</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Failed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {runs.map((run) => (
                  <TableRow key={run.id}>
                    <TableCell>{formatDateTime(run.started_at)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{run.status}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {run.matched_count}
                    </TableCell>
                    <TableCell className="text-right">
                      {run.queued_count}
                    </TableCell>
                    <TableCell className="text-right text-emerald-600">
                      {run.sent_count}
                    </TableCell>
                    <TableCell className="text-right text-destructive">
                      {run.failed_count}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
