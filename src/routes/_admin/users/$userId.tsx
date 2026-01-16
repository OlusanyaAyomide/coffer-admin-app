'use client';

import { createFileRoute } from '@tanstack/react-router';
// import { ChevronLeft } from 'lucide-react';
// import { useRouter } from '@tanstack/react-router';
// import { Button } from '@/components/ui/button';
import UserDetailsHeader from '@/components/users/details/UserDetailsHeader';
import UserDetailsStats from '@/components/users/details/UserDetailsStats';
import UserDetailsTabs from '@/components/users/details/UserDetailsTabs';

export const Route = createFileRoute('/_admin/users/$userId')({
  component: UserDetailsPage,
});

function UserDetailsPage() {
  const { userId } = Route.useParams();
  // const router = useRouter();

  // const handleBack = () => {
  //   router.history.back();
  // };

  return (
    <div className="space-y-6 pb-10">
      {/* Back Button */}
      {/* <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-muted-foreground hover:text-foreground pl-0"
          onClick={handleBack}
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Users
        </Button>
      </div> */}

      {/* Header Section */}
      <UserDetailsHeader userId={userId} />

      {/* Stats Cards */}
      <UserDetailsStats />

      {/* Main Content Tabs */}
      <UserDetailsTabs />
    </div>
  );
}
