import { AlertTriangle, Download, FileText, MapPin, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import { Button } from '@/components/ui/button';
import TransitionLink from '@/components/layout/TransitionLink';

export type DocumentStatus = 'verified' | 'pending' | 'rejected' | 'not_submitted';
export type DocumentType = 'passport' | 'id_card' | 'drivers_license' | 'proof_of_address' | 'selfie';

export interface KycDocument {
  id: string;
  submissionId?: string;
  type: DocumentType;
  title: string;
  subtitle?: string;
  documentId?: string;
  status: DocumentStatus;
  issueDate?: string;
  expiryDate?: string;
  documentDate?: string;
  uploadedDate?: string;
  thumbnailUrl?: string;
}

interface DocumentCardProps {
  document: KycDocument;
  onViewFull?: () => void;
  onDownload?: () => void;
}

const getDocumentIcon = (type: DocumentType) => {
  switch (type) {
    case 'passport':
    case 'id_card':
    case 'drivers_license':
      return Shield;
    case 'proof_of_address':
      return MapPin;
    case 'selfie':
      return FileText;
    default:
      return FileText;
  }
};

const getStatusBadge = (status: DocumentStatus) => {
  switch (status) {
    case 'verified':
      return { label: 'Verified', className: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20' };
    case 'pending':
      return { label: 'Pending', className: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20' };
    case 'rejected':
      return { label: 'Rejected', className: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' };
    case 'not_submitted':
      return { label: 'Not Submitted', className: 'bg-muted text-muted-foreground border-border' };
    default:
      return { label: status, className: 'bg-muted text-muted-foreground border-border' };
  }
};

export default function DocumentCard({ document, onViewFull, onDownload }: DocumentCardProps) {
  const Icon = getDocumentIcon(document.type);
  const statusBadge = getStatusBadge(document.status);

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 pb-0">
        <div>
          <h4 className="font-semibold text-sm">{document.title}</h4>
          {document.subtitle && (
            <p className="text-xs text-muted-foreground">{document.subtitle}</p>
          )}
          {document.documentId && (
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              Document ID: {document.documentId}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {document.status !== 'not_submitted' && onDownload && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={onDownload}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <span className={cn(
            'text-xs font-medium px-2.5 py-1 rounded-full border',
            statusBadge.className
          )}>
            {statusBadge.label}
          </span>
        </div>
      </div>

      {/* Thumbnail / Placeholder */}
      <div className="mx-4 my-3">
        {document.thumbnailUrl ? (
          <div className="aspect-4/3 rounded-lg overflow-hidden bg-muted">
            <img
              src={document.thumbnailUrl}
              alt={document.title}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-4/3 rounded-lg bg-secondary/50 flex items-center justify-center">
            <Icon className="h-10 w-10 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Date Info */}
      <div className="px-4 pb-3 flex gap-6">
        {document.issueDate && (
          <div>
            <p className="text-xs text-muted-foreground">Issue Date</p>
            <p className="text-sm font-medium">{formatDateToReadableShort(document.issueDate)}</p>
          </div>
        )}
        {document.expiryDate && (
          <div>
            <p className="text-xs text-muted-foreground">Expiry Date</p>
            <p className="text-sm font-medium">{formatDateToReadableShort(document.expiryDate)}</p>
          </div>
        )}
        {document.documentDate && (
          <div>
            <p className="text-xs text-muted-foreground">Document Date</p>
            <p className="text-sm font-medium">{formatDateToReadableShort(document.documentDate)}</p>
          </div>
        )}
        {document.uploadedDate && (
          <div>
            <p className="text-xs text-muted-foreground">Uploaded</p>
            <p className="text-sm font-medium">{formatDateToReadableShort(document.uploadedDate)}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {document.status !== 'not_submitted' && (
        <div className="px-4 pb-4">
          <Button
            className="w-full"
            onClick={onViewFull}
          >
            View Full
          </Button>
        </div>
      )}
    </div>
  );
}

// Compact document preview card (small thumbnail with info)
interface DocumentPreviewProps {
  document: KycDocument;
  onView?: () => void;
}

export function DocumentPreview({ document, onView }: DocumentPreviewProps) {
  const Icon = getDocumentIcon(document.type);
  const statusBadge = getStatusBadge(document.status);

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-12 rounded-md overflow-hidden bg-secondary/50">
        {document.thumbnailUrl ? (
          <img
            src={document.thumbnailUrl}
            alt={document.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon className="h-5 w-5 text-muted-foreground/40" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm truncate">{document.title}</h4>
        {document.uploadedDate && (
          <p className="text-xs text-primary mt-0.5">
            Uploaded: {formatDateToReadableShort(document.uploadedDate)}
          </p>
        )}
      </div>

      {/* Status Badge + View Button on same line */}
      <div className="flex items-center gap-2 shrink-0">
        <span className={cn(
          'text-[10px] font-medium px-2 py-0.5 rounded-full border',
          statusBadge.className
        )}>
          {statusBadge.label}
        </span>
        {document.submissionId ? (
          <TransitionLink to={`/kyc/${document.submissionId}`}>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
            >
              View
            </Button>
          </TransitionLink>
        ) : (
          onView && document.status !== 'not_submitted' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-primary hover:text-primary hover:bg-primary/10"
              onClick={onView}
            >
              View
            </Button>
          )
        )}
      </div>
    </div>
  );
}

// KYC Status Banner
export type KycBand = 'band_a' | 'band_b' | 'band_c';

interface KycStatusBannerProps {
  band: KycBand;
  expiryDate?: string;
}

const getBandInfo = (band: KycBand) => {
  switch (band) {
    case 'band_a':
      return {
        label: 'KYC Tier 3 Verified',
        description: 'All identity documents have been verified and approved. User has full access to all platform features.',
        icon: Shield,
        className: 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400',
        iconClassName: 'text-green-500',
      };
    case 'band_b':
      return {
        label: 'KYC Tier 2 - Partial Verification',
        description: 'Basic identity verified. Additional documents required for full access.',
        icon: AlertTriangle,
        className: 'bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400',
        iconClassName: 'text-orange-500',
      };
    case 'band_c':
      return {
        label: 'KYC Not Started',
        description: 'No verification documents have been submitted. User has limited platform access.',
        icon: AlertTriangle,
        className: 'bg-muted border-border text-muted-foreground',
        iconClassName: 'text-muted-foreground',
      };
  }
};

export function KycStatusBanner({ band, expiryDate }: KycStatusBannerProps) {
  const bandInfo = getBandInfo(band);
  const Icon = bandInfo.icon;

  return (
    <div className={cn(
      'rounded-lg border p-4 flex items-start gap-3',
      bandInfo.className
    )}>
      <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', bandInfo.iconClassName)} />
      <div>
        <h4 className="font-semibold text-sm">{bandInfo.label}</h4>
        <p className="text-xs mt-0.5 opacity-90">
          {bandInfo.description}
          {expiryDate && ` Documents are valid until ${formatDateToReadableShort(expiryDate)}.`}
        </p>
      </div>
    </div>
  );
}
