'use client';

import { createFileRoute } from '@tanstack/react-router';
import KycViewPage from '@/components/kyc/view/KycViewPage';
import HeaderNavButton from '@/components/shared/HeaderNavButton';

export const Route = createFileRoute('/_admin/kyc/$kycId')({
  component: KycViewRoute,
});

function KycViewRoute() {
  return (
    <div className="space-y-6 pb-10">
      <HeaderNavButton>
        <span />
      </HeaderNavButton>
      <KycViewPage />
    </div>
  );
}
