import { History, Pencil, Send } from 'lucide-react';

import type { Campaign } from '@/types/CampaignTypes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import CampaignFormSheet from '@/components/campaign/CampaignFormSheet';
import CampaignRunsSheet from '@/components/campaign/CampaignRunsSheet';
import useCampaignAction from '@/hooks/useCampaignAction';
import useDeleteCampaign from '@/hooks/useDeleteCampaign';

export default function CampaignRowActions({ campaign }: { campaign: Campaign }) {
  const { runAction: schedule, isRunningAction: isScheduling } = useCampaignAction(
    { campaignId: campaign.id, action: 'schedule' },
  );
  const { runAction: pause, isRunningAction: isPausing } = useCampaignAction({
    campaignId: campaign.id,
    action: 'pause',
  });
  const { runAction: sendNow, isRunningAction: isSending } = useCampaignAction({
    campaignId: campaign.id,
    action: 'send-now',
  });
  const { deleteCampaign, isDeletingCampaign } = useDeleteCampaign({
    campaignId: campaign.id,
  });

  const canSchedule =
    campaign.schedule_kind !== 'immediate' &&
    (campaign.status === 'draft' || campaign.status === 'paused');
  const canPause =
    campaign.status === 'active' || campaign.status === 'scheduled';

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <CampaignRunsSheet
        campaign={campaign}
        trigger={
          <Button variant="outline" size="sm" className="gap-1.5">
            <History className="h-3.5 w-3.5" />
            Runs
          </Button>
        }
      />

      <CampaignFormSheet
        campaign={campaign}
        defaultChannel={campaign.channel}
        trigger={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        }
      />

      {canSchedule && (
        <Button
          variant="outline"
          size="sm"
          disabled={isScheduling}
          onClick={() => schedule(undefined)}
        >
          {isScheduling ? 'Scheduling…' : 'Schedule'}
        </Button>
      )}

      {canPause && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPausing}
          onClick={() => pause(undefined)}
        >
          {isPausing ? 'Pausing…' : 'Pause'}
        </Button>
      )}

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5" disabled={isSending}>
            <Send className="h-3.5 w-3.5" />
            Send now
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send “{campaign.name}” now?</AlertDialogTitle>
            <AlertDialogDescription>
              This immediately dispatches the campaign to everyone in its
              audience. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                sendNow(undefined);
              }}
              disabled={isSending}
            >
              {isSending ? 'Sending…' : 'Send now'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{campaign.name}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This archives the campaign and removes it from the list. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingCampaign}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteCampaign(undefined);
              }}
              disabled={isDeletingCampaign}
            >
              {isDeletingCampaign ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
