'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import type { KycSubmittedDataWithUrls, KycDocumentField } from '@/types/UserTypes';
import { formatDateToReadable } from '@/services/TimeServices';
import KycSubmissionDetails from './KycSubmissionDetails';
import TransitionLink from '@/components/layout/TransitionLink';

interface AcceptedKycsListProps {
  submissions: KycSubmittedDataWithUrls[];
}

const SnapshotThumbnail = ({ doc, title }: { doc?: KycDocumentField; title: string }) => {
  if (!doc?.temporary_signed_url) return null;

  const isImage = doc.mime_type?.includes('image') || doc.temporary_signed_url.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) != null;

  if (!isImage) {
    return (
      <div className="w-20 h-20 rounded bg-muted flex items-center justify-center border" title={title}>
        <FileText className="w-8 h-8 text-muted-foreground" />
      </div>
    );
  }

  return (
    <PhotoView src={doc.temporary_signed_url}>
      <div className="w-20 h-20 rounded overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity">
        <img
          src={doc.temporary_signed_url}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
    </PhotoView>
  );
};

const AcceptedKycItem = ({ submission }: { submission: KycSubmittedDataWithUrls }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="border rounded-lg overflow-hidden">
      <div
        className="p-4 bg-muted/30 flex justify-between items-center cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            {submission.associated_with?.replace(/_/g, ' ').toUpperCase() || 'KYC'}
          </Badge>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Accepted Submission</span>
            <span className="text-xs text-muted-foreground">{formatDateToReadable(submission.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TransitionLink to={`/kyc/${submission.id}`}>
            <Button variant="outline" size="sm" className="h-7 text-xs" onClick={(e) => e.stopPropagation()}>
              <Eye className="w-3 h-3 mr-2" /> View
            </Button>
          </TransitionLink>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 space-y-6 border-t animate-in slide-in-from-top-2 duration-200">
          {/* Reuse Details Component */}
          <KycSubmissionDetails kyc={submission} />

          {/* Documents Thumbnails */}
          <div>
            <h4 className="text-sm font-semibold mb-3">Documents</h4>
            <PhotoProvider>
              <div className="flex gap-2 flex-wrap">
                <SnapshotThumbnail doc={submission.proof_of_identity_document} title="Identity Document" />
                <SnapshotThumbnail doc={submission.proof_of_identity_back_view} title="Identity Back" />
                <SnapshotThumbnail doc={submission.face_image} title="Face Image" />
                <SnapshotThumbnail doc={submission.proof_of_address_document} title="Proof of Address" />
                <SnapshotThumbnail doc={submission.proof_of_income_document} title="Proof of Income" />
              </div>
            </PhotoProvider>
          </div>
        </div>
      )}
    </div>
  );
};

export default function AcceptedKycsList({ submissions }: AcceptedKycsListProps) {
  if (!submissions || submissions.length === 0) return null;

  return (
    <Card className="border-green-200 bg-green-50/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700">
          <CheckCircle2 className="w-5 h-5" /> Previously Accepted KYC
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {submissions.map((sub) => (
          <AcceptedKycItem key={sub.id} submission={sub} />
        ))}
      </CardContent>
    </Card>
  );
}
