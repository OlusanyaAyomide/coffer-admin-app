'use client';

import { createFileRoute } from '@tanstack/react-router';
// import { ChevronLeft } from 'lucide-react';
// import { useRouter } from '@tanstack/react-router';
// import { Button } from '@/components/ui/button';
import UserDetailsHeader from '@/components/users/details/UserDetailsHeader';
import UserDetailsStats from '@/components/users/details/UserDetailsStats';
import UserDetailsTabs from '@/components/users/details/UserDetailsTabs';
import HeaderNavButton from '@/components/shared/HeaderNavButton';

export const Route = createFileRoute('/_admin/users/$userId')({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { userId } = Route.useParams();


  return (
    <div className="space-y-6 pb-10">
      {/* Back Button */}
      <HeaderNavButton>
        <span />
      </HeaderNavButton>
      {/* Header Section */}
      <UserDetailsHeader userId={userId} />

      {/* Stats Cards */}
      <UserDetailsStats userId={userId} />

      {/* Main Content Tabs */}
      <UserDetailsTabs userId={userId} />
    </div>
  );
}
