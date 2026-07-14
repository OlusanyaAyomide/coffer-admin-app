import { createFileRoute } from '@tanstack/react-router';

import CampaignsListView from '@/components/campaign/CampaignsListView';

export const Route = createFileRoute('/_admin/communication/email')({
  component: EmailCampaignsPage,
});

function EmailCampaignsPage() {
  return (
    <CampaignsListView
      channel="email"
      title="Email Campaigns"
      description="Compose and schedule email blasts to a preset audience. Drafts stay unsent until you send now or activate a schedule."
    />
  );
}
