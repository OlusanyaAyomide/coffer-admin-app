import { createFileRoute } from '@tanstack/react-router';

import CampaignsListView from '@/components/campaign/CampaignsListView';

export const Route = createFileRoute('/_admin/communication/notifications')({
  component: PushCampaignsPage,
});

function PushCampaignsPage() {
  return (
    <CampaignsListView
      channel="push"
      title="Push Notifications"
      description="Compose and schedule push notifications to a preset audience. Only users with a registered device who haven’t opted out of marketing are reached."
    />
  );
}
