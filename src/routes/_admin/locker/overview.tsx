import { createFileRoute } from '@tanstack/react-router';

import AdminOverviewPage from '@/components/admin-overview/AdminOverviewPage';

export const Route = createFileRoute('/_admin/locker/overview')({
  component: AdminOverviewPage,
});
