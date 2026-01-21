import { useState } from 'react';

import KycDocumentReview from './KycDocumentReview';
import KycSubmittedInformation from './KycSubmittedInformation';
import KycAdminNotes from './KycAdminNotes';
import KycUserInfoCard from './KycUserInfoCard';
import KycVerificationChecklist from './KycVerificationChecklist';

import RequestMoreInfoDialog from './dialogs/RequestMoreInfoDialog';
import ApproveKycDialog from './dialogs/ApproveKycDialog';
import RejectKycDialog from './dialogs/RejectKycDialog';
import KycActionButtons from './KycActionButtons';

// Types
export type KycBand = 'band_a' | 'band_b' | 'band_c';
export type DocumentTab = 'passport' | 'selfie' | 'address_proof';

export interface KycViewData {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  current_band: KycBand;
  requesting_band: KycBand;
  applied_at: string;
  documents: {
    passport?: {
      url: string;
      title: string;
    };
    selfie?: {
      url: string;
      title: string;
    };
    address_proof?: {
      url: string;
      title: string;
    };
  };
  submitted_info: {
    full_name: string;
    date_of_birth: string;
    document_number: string;
    nationality: string;
    issue_date: string;
    expiry_date: string;
  };
  admin_notes: Array<{
    id: string;
    content: string;
    created_at: string;
    admin_name: string;
  }>;
}

// Mock data
const mockKycData: KycViewData = {
  id: 'KYC-001',
  user: {
    id: 'UID-5502',
    name: 'Jessica Morgan',
    email: 'jessica.m@example.com',
  },
  current_band: 'band_c',
  requesting_band: 'band_a',
  applied_at: '2023-11-05T00:00:00Z',
  documents: {
    passport: {
      url: 'https://res.cloudinary.com/dsjmccsbe/image/upload/v1759999080/prly/sandbox/r2nfgruqqgperz4szabe.jpg',
      title: 'Passport - Front Page',
    },
    selfie: {
      url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop',
      title: 'Selfie with Document',
    },
    address_proof: {
      url: 'https://example.com/documents/address-proof.pdf',
      title: 'Utility Bill',
    },
  },
  submitted_info: {
    full_name: 'Jessica Morgan',
    date_of_birth: 'March 15, 1992',
    document_number: 'P88291092',
    nationality: 'United Kingdom',
    issue_date: 'Jan 10, 2021',
    expiry_date: 'Jan 10, 2031',
  },
  admin_notes: [
    {
      id: 'note-1',
      content: 'Document verified against database. All information matches.',
      created_at: '2023-11-06T10:30:00Z',
      admin_name: 'Admin User',
    },
  ],
};

// Helper to check if URL is an image
const isImageUrl = (url?: string): boolean => {
  if (!url) return false;
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
  const lowerUrl = url.toLowerCase();
  return imageExtensions.some((ext) => lowerUrl.includes(ext));
};

interface KycViewPageProps {
  kycId: string;
}

export default function KycViewPage({ kycId }: KycViewPageProps) {
  // In real app, fetch data based on kycId
  console.log('Viewing KYC:', kycId);
  const data = mockKycData;

  // State
  const [activeTab, setActiveTab] = useState<DocumentTab>('passport');
  const [checklist, setChecklist] = useState({
    document_clear: true,
    info_matches: true,
    not_expired: true,
    face_matches: false,
    no_tampering: true,
  });

  // Dialogs
  const [requestInfoOpen, setRequestInfoOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);

  // Get current document based on tab
  const getCurrentDocument = () => {
    switch (activeTab) {
      case 'passport':
        return data.documents.passport;
      case 'selfie':
        return data.documents.selfie;
      case 'address_proof':
        return data.documents.address_proof;
      default:
        return data.documents.passport;
    }
  };

  const currentDoc = getCurrentDocument();

  // Handle document view - only for non-images (images are handled by PhotoView in KycDocumentReview)
  const handleViewDocument = () => {
    if (currentDoc?.url && !isImageUrl(currentDoc.url)) {
      window.open(currentDoc.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Handle checklist toggle
  const handleChecklistToggle = (key: keyof typeof checklist) => {
    setChecklist((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Action handlers
  const handleApprove = () => {
    console.log('Approving KYC:', kycId);
    setApproveOpen(false);
    // TODO: Call API
  };

  const handleReject = (title: string, content: string) => {
    console.log('Rejecting KYC:', kycId, 'Title:', title, 'Reason:', content);
    setRejectOpen(false);
    // TODO: Call API
  };

  const handleRequestMoreInfo = (title: string, content: string) => {
    console.log('Requesting more info:', { title, content });
    setRequestInfoOpen(false);
    // TODO: Call API
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Document Review */}
          <KycDocumentReview
            activeTab={activeTab}
            onTabChange={setActiveTab}
            currentDocument={currentDoc}
            onViewDocument={handleViewDocument}
            isImageUrl={isImageUrl}
          />

          {/* Submitted Information */}
          <KycSubmittedInformation info={data.submitted_info} />

          {/* Admin Notes - Moved to left column */}
          <KycAdminNotes notes={data.admin_notes} />
        </div>

        {/* Right Column - 1/3 width on desktop */}
        <div className="space-y-6">
          {/* User Info Card */}
          <KycUserInfoCard user={data.user} appliedAt={data.applied_at} currentBand={data.current_band} requestingBand={data.requesting_band} />

          {/* Verification Checklist */}
          <KycVerificationChecklist checklist={checklist} onToggle={handleChecklistToggle} />

          {/* Action Buttons */}
          <KycActionButtons
            onApprove={() => setApproveOpen(true)}
            onReject={() => setRejectOpen(true)}
            onRequestInfo={() => setRequestInfoOpen(true)}
          />
        </div>
      </div>

      {/* Dialogs */}
      <RequestMoreInfoDialog open={requestInfoOpen} onOpenChange={setRequestInfoOpen} onSubmit={handleRequestMoreInfo} />

      <ApproveKycDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        onConfirm={handleApprove}
        userName={data.user.name}
        requestingBand={data.requesting_band}
      />

      <RejectKycDialog
        open={rejectOpen}
        onOpenChange={setRejectOpen}
        onSubmit={handleReject}
        userName={data.user.name}
      />
    </>
  );
}
