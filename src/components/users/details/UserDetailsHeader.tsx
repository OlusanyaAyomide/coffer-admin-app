import { CheckCircle2, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import useGetRequest from '@/hooks/useGetRequests';
import type { AccountOverviewData } from '@/types/UserTypes';
import type { QueryError } from '@/types/ResponseTypes';
import { formatRelativeDateTime } from '@/services/TimeServices';
import handleOptionalData from '@/services/emptyDataServices';

type AccountOverviewResponse = {
  success: boolean;
  data: AccountOverviewData;
};

export default function UserDetailsHeader({ userId }: { userId: string }) {
  const { data, isLoading } = useGetRequest<AccountOverviewResponse, QueryError>({
    URL: `/admin/customer/${userId}/account-overview`,
    queryKey: ['user-account-overview', userId],
  });

  const userHeader = data?.data?.user_header;

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div>
            <div className="flex items-center gap-3">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-4 mt-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-3 w-32 mt-2" />
          </div>
        </div>
        <Skeleton className="h-10 w-[160px]" />
      </div>
    );
  }

  const statusConfig = {
    active: { label: 'Active', color: 'bg-green-500/10 text-green-600 hover:bg-green-500/20', dotColor: 'bg-green-500' },
    under_revieiw: { label: 'Under Review', color: 'bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20', dotColor: 'bg-yellow-500' },
    deactivated: { label: 'Deactivated', color: 'bg-red-500/10 text-red-600 hover:bg-red-500/20', dotColor: 'bg-red-500' },
  };

  const status = statusConfig[userHeader?.status || 'active'];
  const initials = userHeader?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'U';

  return (
    <div className="bg-card border border-border rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Avatar className="h-16 w-16 border-2 border-background">
            <AvatarImage src={userHeader?.profile_image?.url} alt={userHeader?.full_name || 'User'} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <span className={cn(
            "absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-background",
            userHeader?.status === 'active' ? 'bg-green-500' : 'bg-muted'
          )}></span>
        </div>

        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold text-foreground">{handleOptionalData(userHeader?.full_name)}</h1>
            <span className="text-sm text-muted-foreground">Email: {handleOptionalData(userHeader?.email)}</span>
            <Badge variant="secondary" className={cn("border-0", status.color)}>
              <span className={cn("h-1.5 w-1.5 rounded-full mr-1.5", status.dotColor)}></span>
              {status.label}
            </Badge>
          </div>

          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground flex-wrap">
            {userHeader?.country_name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                <span>Region: {handleOptionalData(userHeader.country_name)}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{handleOptionalData(userHeader?.tier_label)}</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground mt-1">
            Last active: {userHeader?.last_active ? formatRelativeDateTime(userHeader.last_active) : 'N/A'}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <Button className="bg-primary w-[160px] hover:bg-primary/80 text-white gap-2">
          <Mail className="h-4 w-4" />
          Send Email
        </Button>
      </div>
    </div>
  );
}
