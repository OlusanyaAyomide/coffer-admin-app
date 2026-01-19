import { useState } from 'react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import DocumentCard, {
  DocumentPreview,
  
  
  KycStatusBanner
} from './DocumentCard';
import type {KycBand, KycDocument} from './DocumentCard';

// Helper to check if URL is an image
const isImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some(ext => lowerUrl.includes(ext));
};

// Mock data - Band A (All verified) with sample image URLs
const mockDocumentsBandA: Array<KycDocument> = [
  {
    id: '1',
    type: 'passport',
    title: 'Passport',
    documentId: 'GBR-88291012',
    status: 'verified',
    issueDate: '2020-01-15T00:00:00Z',
    expiryDate: '2030-01-15T00:00:00Z',
    thumbnailUrl: 'https://res.cloudinary.com/dsjmccsbe/image/upload/v1759999080/prly/sandbox/r2nfgruqqgperz4szabe.jpg',
  },
  {
    id: '2',
    type: 'proof_of_address',
    title: 'Proof of Address',
    subtitle: 'Utility Bill',
    status: 'verified',
    documentDate: '2023-09-01T00:00:00Z',
    uploadedDate: '2023-10-12T00:00:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&h=300&fit=crop',
  },
];

// Mock data - Band B (Partial)
const mockDocumentsBandB: Array<KycDocument> = [
  {
    id: '1',
    type: 'id_card',
    title: 'National ID Card',
    documentId: 'NGA-12345678',
    status: 'verified',
    issueDate: '2021-05-20T00:00:00Z',
    expiryDate: '2026-05-20T00:00:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1578670812003-60745e2c2ea9?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    type: 'proof_of_address',
    title: 'Proof of Address',
    subtitle: 'Required',
    status: 'not_submitted',
  },
];

// Mock data - Band C (No verification)
const mockDocumentsBandC: Array<KycDocument> = [
  {
    id: '1',
    type: 'passport',
    title: 'Identity Document',
    subtitle: 'Passport or ID Card',
    status: 'not_submitted',
  },
  {
    id: '2',
    type: 'proof_of_address',
    title: 'Proof of Address',
    subtitle: 'Utility Bill or Bank Statement',
    status: 'not_submitted',
  },
];

// Mock rejected document for tracking
const mockRejectedDocuments: Array<KycDocument> = [
  {
    id: '3',
    type: 'drivers_license',
    title: 'Driver\'s License',
    documentId: 'DL-98765432',
    status: 'rejected',
    uploadedDate: '2023-09-20T00:00:00Z',
    thumbnailUrl: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop',
  },
];

interface KycInformationTabProps {
  userBand?: KycBand;
}

export default function KycInformationTab({ userBand = 'band_a' }: KycInformationTabProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Get documents based on band
  const getDocuments = () => {
    switch (userBand) {
      case 'band_a':
        return mockDocumentsBandA;
      case 'band_b':
        return mockDocumentsBandB;
      case 'band_c':
        return mockDocumentsBandC;
    }
  };

  const documents = getDocuments();
  const expiryDate = userBand === 'band_a' ? '2025-10-15T00:00:00Z' : undefined;

  const handleViewFull = (doc: KycDocument) => {
    if (doc.thumbnailUrl && isImageUrl(doc.thumbnailUrl)) {
      // For images, open in PhotoView
      setSelectedImage(doc.thumbnailUrl);
    } else if (doc.thumbnailUrl) {
      // For non-image files (PDF, etc.), open externally
      window.open(doc.thumbnailUrl, '_blank', 'noopener,noreferrer');
    } else {
      console.log('No document URL available');
    }
  };

  const handleDownload = (doc: KycDocument) => {
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

  const handleViewDocument = (doc: KycDocument) => {
    handleViewFull(doc);
  };

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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
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
        </div>

        {/* Rejected/Previous Submissions - For admin tracking */}
        {mockRejectedDocuments.length > 0 && (
          <div className="rounded-lg border border-border bg-card p-5">
            <h3 className="text-base font-semibold mb-4">Previous Submissions</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Documents that were rejected or replaced. Useful for tracking verification history.
            </p>

            <div className="space-y-3">
              {mockRejectedDocuments.map((doc) => (
                <DocumentPreview
                  key={doc.id}
                  document={doc}
                  onView={() => handleViewDocument(doc)}
                />
              ))}
            </div>
          </div>
        )}

        {/* KYC Status Banner */}
        <KycStatusBanner band={userBand} expiryDate={expiryDate} />
      </div>
    </PhotoProvider>
  );
}
