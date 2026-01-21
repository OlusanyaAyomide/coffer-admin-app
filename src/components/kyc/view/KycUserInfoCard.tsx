'use client';

import type { KycBand } from './KycViewPage';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDateToReadableShort } from '@/services/TimeServices';

interface UserInfo {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface KycUserInfoCardProps {
  user: UserInfo;
  appliedAt: string;
  currentBand: KycBand;
  requestingBand: KycBand;
}

const getBandLabel = (band: KycBand): string => {
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

const getBandColor = (band: KycBand): string => {
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
  value: string;
  valueClassName?: string;
}

function InfoRow({ label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="flex justify-between items-center py-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium ${valueClassName || ''}`}>{value}</span>
    </div>
  );
}

export default function KycUserInfoCard({
  user,
  appliedAt,
  currentBand,
  requestingBand,
}: KycUserInfoCardProps) {
  const initials = user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* User Avatar & Name */}
      <div className="flex items-center gap-3 mb-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback className="bg-purple-500 text-white font-medium">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.id}</p>
        </div>
      </div>

      {/* Info Rows */}
      <div className="border-t border-border pt-3">
        <InfoRow label="Email" value={user.email} />
        <InfoRow label="Applied" value={formatDateToReadableShort(appliedAt)} />
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
      </div>
    </div>
  );
}
