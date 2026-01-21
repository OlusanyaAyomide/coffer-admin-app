import type { ExtendedColumnDef } from '@/components/shared/BaseDataTable';
import type { MobileRow } from '@/components/shared/MobileCards';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';

// KYC Submission types
export type KycStatus = 'pending' | 'approved' | 'rejected' | 'under_review';
export type KycBand = 'band_a' | 'band_b' | 'band_c';

export interface KycSubmission {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  kyc_band: KycBand;
  status: KycStatus;
  country: string;
  document_type: string;
  submitted_at: string;
  reviewed_at?: string;
  reviewer?: string;
}

// Status color helper
const getStatusColor = (status: KycStatus) => {
  switch (status) {
    case 'approved':
      return 'text-green-600 dark:text-green-400';
    case 'pending':
      return 'text-orange-600 dark:text-orange-400';
    case 'rejected':
      return 'text-red-600 dark:text-red-400';
    case 'under_review':
      return 'text-blue-600 dark:text-blue-400';
    default:
      return 'text-muted-foreground';
  }
};

// Status label helper  
const getStatusLabel = (status: KycStatus) => {
  const labels: Record<KycStatus, string> = {
    pending: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    under_review: 'Under Review',
  };
  return labels[status];
};

// Band label helper
const getBandLabel = (band: KycBand) => {
  const labels: Record<KycBand, string> = {
    band_a: 'Band A',
    band_b: 'Band B',
    band_c: 'Band C',
  };
  return labels[band];
};

// Table columns
export const createKycColumns = (
  onViewDetails: (submission: KycSubmission) => void
): Array<ExtendedColumnDef<KycSubmission>> => [
    {
      accessorKey: 'user_name',
      header: 'Name',
      cell: ({ row }) => (
        <span className="font-medium text-sm">{row.original.user_name}</span>
      ),
    },
    {
      accessorKey: 'user_email',
      header: 'Email',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.user_email}</span>
      ),
    },
    {
      accessorKey: 'kyc_band',
      header: 'KYC Band',
      cell: ({ row }) => (
        <span className="text-sm font-medium">
          {getBandLabel(row.original.kyc_band)}
        </span>
      ),
    },
    {
      accessorKey: 'document_type',
      header: 'Document Type',
      cell: ({ row }) => (
        <span className="text-sm capitalize">
          {row.original.document_type.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      accessorKey: 'country',
      header: 'Country',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.country}</span>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <span
          className={cn(
            'text-sm font-medium whitespace-nowrap',
            getStatusColor(row.original.status)
          )}
        >
          {getStatusLabel(row.original.status)}
        </span>
      ),
    },
    {
      accessorKey: 'submitted_at',
      header: 'Submitted',
      cell: ({ row }) => (
        <span className="text-muted-foreground whitespace-nowrap text-sm">
          {formatDateToReadableShort(row.original.submitted_at)}
        </span>
      ),
    },
    {
      accessorKey: 'action',
      header: 'Actions',
      meta: { className: 'w-[80px]' },
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary hover:bg-primary/10"
          onClick={() => onViewDetails(row.original)}
        >
          View
        </Button>
      ),
    },
  ];

// Mobile columns
export const kycMobileColumns: Array<MobileRow<KycSubmission>> = [
  {
    cell: ({ row }) => (
      <span className={cn('text-xs font-medium', getStatusColor(row.status))}>
        {getStatusLabel(row.status)}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {getBandLabel(row.kyc_band)}
      </span>
    ),
    showBorder: true,
  },
  {
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
        {formatDateToReadableShort(row.submitted_at)}
      </span>
    ),
    showBorder: false,
  },
];

// Mobile card title
export const getKycMobileTitle = (row: KycSubmission) => {
  return (
    <div className="flex flex-col">
      <span className="font-medium text-foreground">{row.user_name}</span>
      <span className="text-xs text-muted-foreground">{row.document_type.replace(/_/g, ' ')}</span>
    </div>
  );
};

// Mobile card action
export const KycMobileAction = ({
  row,
  onViewDetails,
}: {
  row: KycSubmission;
  onViewDetails: (submission: KycSubmission) => void;
}) => (
  <Button
    variant="ghost"
    size="sm"
    className="text-primary hover:text-primary hover:bg-primary/10"
    onClick={() => onViewDetails(row)}
  >
    View
  </Button>
);

// Mobile card footer - full width
export const getKycMobileFooter = ({ row }: { row: KycSubmission }) => (
  <div className="flex flex-col w-full text-xs gap-1">
    <div className="flex justify-between">
      <span className="text-muted-foreground">{row.country}</span>
      <span className="text-muted-foreground">{formatDateToReadableShort(row.submitted_at)}</span>
    </div>
    <span className="text-muted-foreground truncate">{row.user_email}</span>
  </div>
);
