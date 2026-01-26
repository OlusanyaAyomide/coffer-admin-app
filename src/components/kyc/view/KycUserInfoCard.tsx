'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateToReadableShort, formatRelativeDateTime } from '@/services/TimeServices';
import useWindowProperties from '@/hooks/useWindowProperty';
import TransitionLink from '@/components/layout/TransitionLink';

interface UserInfo {
  id: string; // Coffer ID
  userId?: string; // DB UUID for navigation
  name: string;
  email: string;
  avatar?: string;
}

interface KycUserInfoCardProps {
  user: UserInfo;
  appliedAt: string;
  currentBand: string;
  requestingBand: string;
  country?: string;
  idType?: string;
  dob?: string;
  idExpiry?: string;
}

const getBandLabel = (band: string): string => {
  switch (band) {
    case 'band_a':
      return 'Band A';
    case 'band_b':
      return 'Band B';
    case 'band_c':
      return 'Band C';
    default:
      return band;
  }
};

const getBandColor = (band: string): string => {
  switch (band) {
    case 'band_a':
      return 'text-green-500';
    case 'band_b':
      return 'text-orange-500';
    case 'band_c':
      return 'text-primary';
    default:
      return 'text-muted-foreground';
  }
};

interface InfoRowProps {
  label: string;
  value: React.ReactNode;
  valueClassName?: string;
}

function InfoRow({ label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-1.5 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${valueClassName || ''} capitalize`}>{value}</span>
    </div>
  );
}

export default function KycUserInfoCard({
  user,
  appliedAt,
  currentBand,
  requestingBand,
  country,
  idType,
  dob,
  idExpiry
}: KycUserInfoCardProps) {
  const { isMounted } = useWindowProperties({});

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '??';

  return (
    <div className="rounded-lg border border-border bg-card p-5 h-fit">
      {/* User Avatar & Name */}
      <div className="flex items-center gap-3 mb-6">
        <Avatar className="h-12 w-12 text-primary">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-primary/10 text-primary font-bold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="overflow-hidden">
          {user.userId ? (
            <TransitionLink to={`/users/${user.userId}`} className="hover:underline">
              <h3 className="font-semibold truncate">{user.name}</h3>
            </TransitionLink>
          ) : (
            <h3 className="font-semibold truncate">{user.name}</h3>
          )}
          <p className="text-sm text-muted-foreground truncate">{user.id}</p>
        </div>
      </div>

      {/* Info Rows */}
      <div className="space-y-1">
        <InfoRow
          label="Email"
          value={user.userId ? (
            <TransitionLink to={`/users/${user.userId}`} className="hover:underline">
              {user.email}
            </TransitionLink>
          ) : user.email}
        />
        <InfoRow label="Applied" value={isMounted ? formatRelativeDateTime(appliedAt) : formatDateToReadableShort(appliedAt)} />
        <InfoRow
          label="Current Band"
          value={getBandLabel(currentBand)}
          valueClassName={getBandColor(currentBand)}
        />
        <InfoRow
          label="Requesting"
          value={getBandLabel(requestingBand)}
          valueClassName={getBandColor(requestingBand)}
        />
        {country && <InfoRow label="Country" value={country} />}
        {idType && <InfoRow label="ID Type" value={idType.replace(/_/g, ' ')} />}
        {dob && <InfoRow label="Date of Birth" value={formatDateToReadableShort(dob)} />}
        {idExpiry && <InfoRow label="ID Expiry" value={formatDateToReadableShort(idExpiry)} />}
      </div>
    </div>
  );
}
