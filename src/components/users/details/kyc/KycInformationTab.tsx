import { useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import DocumentCard, {
  DocumentPreview,
  KycStatusBanner
} from './DocumentCard';
import type { KycDocument as UiKycDocument, DocumentStatus } from './DocumentCard';
import useGetRequest from '@/hooks/useGetRequests';
import { KycDocumentsResponse, KycDocument as ApiKycDocument } from '@/types/UserTypes';
import { Skeleton } from '@/components/ui/skeleton';
import { QueryError } from '@/types/ResponseTypes';

// Helper to check if URL is an image
const isImageUrl = (url?: string): boolean => {
  if (!url) return false;
  // Remove query params for extension check if needed.
  const baseUrl = url.split('?')[0].toLowerCase();
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
  return imageExtensions.some(ext => baseUrl.endsWith(ext));
};

interface KycInformationTabProps {
  userId: string;
}

export default function KycInformationTab({ userId }: KycInformationTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data, isLoading } = useGetRequest<KycDocumentsResponse, QueryError>({
    URL: `/admin/customer/${userId}/kyc-documents`,
    queryKey: ['user-kyc-documents', userId],
    enabled: !!userId,
  });

  const kycData = data?.data;

  // Map API document to UI document
  const mapDocument = (doc: ApiKycDocument): UiKycDocument => {
    let status: DocumentStatus = 'not_submitted';
    if (doc.status === 'accepted') status = 'verified';
    else if (doc.status === 'pending') status = 'pending';
    else if (doc.status === 'rejected') status = 'rejected';
    else if (doc.status === 'invalidated') status = 'rejected';

    return {
      id: doc.id,
      submissionId: doc.submission_id,
      type: doc.type as any, // Cast to UI type provided it matches or we are lenient
      title: doc.title,
      subtitle: doc.subtitle,
      documentId: doc.documentId,
      status: status,
      issueDate: doc.issueDate,
      expiryDate: doc.expiryDate,
      uploadedDate: doc.uploaded_date,
      thumbnailUrl: doc.thumbnail_url,
    };
  };

  const currentDocuments = kycData?.current_documents.map(mapDocument) || [];
  const historyDocuments = kycData?.history_documents.map(mapDocument) || [];

  const handleViewFull = (doc: UiKycDocument) => {
    if (doc.thumbnailUrl && (isImageUrl(doc.thumbnailUrl) || doc.thumbnailUrl.includes('mime_type=image'))) {
      // For images, open in PhotoView
      setSelectedImage(doc.thumbnailUrl);
    } else if (doc.thumbnailUrl) {
      // For non-image files (PDF, etc.), open externally
      window.open(doc.thumbnailUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.log('No document URL available');
    }
  };

  const handleDownload = (doc: UiKycDocument) => {
    if (doc.thumbnailUrl) {
      // Create a download link
      const link = document.createElement('a');
      link.href = doc.thumbnailUrl;
      link.download = `${doc.title.replace(/\s+/g, '_')}_${doc.id}`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleViewDocument = (doc: UiKycDocument) => {
    handleViewFull(doc);
  };

  // Determine KYC Band for Banner
  let userBand: 'band_a' | 'band_b' | 'band_c' = 'band_c';
  if (kycData?.kyc_status === 'verified') userBand = 'band_a';
  else if (kycData?.kyc_status === 'pending') userBand = 'band_b';

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-5 space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-40 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <PhotoProvider>
      <div className="space-y-6">
        {/* Hidden PhotoView trigger for programmatic opening */}
        {selectedImage && (
          <div style={{ display: 'none' }}>
            <PhotoView src={selectedImage}>
              <img src={selectedImage} alt="" ref={(img) => {
                if (img && selectedImage) {
                  img.click();
                  setSelectedImage(null);
                }
              }} />
            </PhotoView>
          </div>
        )}

        {/* Identity Documents Section */}
        <div className="rounded-lg border border-border bg-card p-5">
          <h3 className="text-base font-semibold mb-4">Identity Documents</h3>

          {currentDocuments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentDocuments.map((doc) => (
                <PhotoProvider key={doc.id}>
                  {doc.thumbnailUrl && isImageUrl(doc.thumbnailUrl) ? (
                    <PhotoView src={doc.thumbnailUrl}>
                      <div>
                        <DocumentCard
                          document={doc}
                          onViewFull={() => { }}
                          onDownload={() => handleDownload(doc)}
                        />
                      </div>
                    </PhotoView>
                  ) : (
                    <DocumentCard
                      document={doc}
                      onViewFull={() => handleViewFull(doc)}
                      onDownload={() => handleDownload(doc)}
                    />
                  )}
                </PhotoProvider>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg">
              No active documents found.
            </div>
          )}
        </div>

        {/* Rejected/Previous Submissions - For admin tracking */}
        {historyDocuments.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-4">Previous Submissions</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Documents that were rejected or replaced. Useful for tracking verification history.
            </p>

            <div className="space-y-3">
              {historyDocuments.map((doc, index) => (
                <DocumentPreview
                  key={(index + 1).toString()}
                  document={doc}
                  onView={() => handleViewDocument(doc)}
                />
              ))}
            </div>
          </div>
        )}

        {/* KYC Status Banner */}
        <KycStatusBanner band={userBand} />
      </div>
    </PhotoProvider>
  );
}
