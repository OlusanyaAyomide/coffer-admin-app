import { useNavigate, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, FileText, Eye, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import useGetRequest from '@/hooks/useGetRequests';
import usePostRequest from '@/hooks/usePostRequests';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import KycUserInfoCard from './KycUserInfoCard';
import AddAdminNoteDialog from '../../users/details/AddAdminNoteDialog';
import KycActionDialog, { KycActionType } from './KycActionDialog';
import KycHistoryList from './KycHistoryList';
import KycSubmissionDetails from './KycSubmissionDetails';
import AcceptedKycsList from './AcceptedKycsList';

import type { KycDetailsResponse } from '@/types/UserTypes';
import { formatDateToReadableShort } from '@/services/TimeServices';

function SimpleDocumentCard({ title, url, type }: { title: string; url: string; type?: string }) {
  const isImage = type?.includes('image') || url.match(/\.(jpeg|jpg|gif|png)(\?|$)/i) != null;

  return (
    <Card className="overflow-hidden">
      <div className="p-3 border-b bg-muted/30 flex justify-between items-center">
        <span className="font-medium text-sm">{title}</span>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => window.open(url, '_blank')}>
          <ExternalLink className="h-3 w-3" />
        </Button>
      </div>
      <div className="aspect-video bg-muted relative group">
        {isImage ? (
          <PhotoView src={url}>
            <div className="w-full h-full cursor-pointer relative">
              <img src={url} alt={title} className="w-full h-full object-contain" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button variant="secondary" size="sm" className="pointer-events-none">
                  <Eye className="w-4 h-4 mr-2" /> View Full
                </Button>
              </div>
            </div>
          </PhotoView>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <FileText className="h-8 w-8" />
            <span className="ml-2 text-xs">Document File</span>
          </div>
        )}
      </div>
    </Card>
  );
}

export default function KycViewPage() {
  const { kycId } = useParams({ from: '/_admin/kyc/$kycId' });
  const navigate = useNavigate();

  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<KycActionType>(null);

  // Fetch KYC Details
  const { data: response, isLoading, refetch } = useGetRequest<KycDetailsResponse, any>({
    URL: `/admin/kyc/${kycId}`,
    queryKey: ['kyc-details', kycId],
  });

  // Process KYC Mutation
  const { mutate: processKyc, isPending: isProcessing } = usePostRequest({
    URL: `/admin/kyc/${kycId}/process`,
    mutationKey: ['process-kyc', kycId],
    showErrorToast: true,
    onSuccess: () => {
      toast.success(`KYC processed successfully`);
      setActionDialogOpen(false);
      refetch();
    }
  });

  // Add Note Mutation
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const { mutate: addNote, isPending: isAddingNote } = usePostRequest({
    URL: `/admin/customer/${response?.data?.user?.id}/notes`,
    mutationKey: ['add-kyc-note', kycId],
    showErrorToast: true,
    onSuccess: () => {
      toast.success('Note added');
      setIsNoteDialogOpen(false);
      refetch();
    }
  });

  const handleSubmitNote = (data: { title?: string; content: string }) => {
    if (!response?.data?.user?.id) return;
    addNote({
      content: data.content,
      title: data.title || 'KYC Review Note',
      kycId: kycId
    });
  };

  const handleAction = (type: KycActionType) => {
    setActionType(type);
    setActionDialogOpen(true);
  };

  const onActionSubmit = ({ reason }: { reason?: string }) => {
    if (!actionType) return;

    let status = '';
    if (actionType === 'approve') status = 'accepted';
    if (actionType === 'reject') status = 'rejected';
    if (actionType === 'more_info') status = 'more_info_requested';

    processKyc({
      status,
      rejection_reason: actionType === 'reject' ? reason : undefined,
      additional_info_requested: actionType === 'more_info' ? reason : undefined,
    });
  };


  if (isLoading) {
    return <div className="p-8 space-y-6"><Skeleton className="h-40 w-full" /><Skeleton className="h-96 w-full" /></div>;
  }

  if (!response) return <div>Error loading KYC details</div>;

  const { kyc, history, accepted_submissions, notes, user } = response.data;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'bg-green-100 text-green-700';
      case 'rejected': return 'bg-red-100 text-red-700';
      case 'pending': return 'bg-orange-100 text-orange-700';
      case 'more_info_requested': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-medium">KYC Submission for {user.first_name + ' ' + user.last_name}</h1>
          <Badge variant="secondary" className={getStatusColor(kyc.status)}>
            {kyc.status.replace(/_/g, ' ').toUpperCase()}
          </Badge>
        </div>
        <p className="text-muted-foreground mt-1">Submission ID: {kycId}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column - Details, Documents, Notes, History */}
        <div className="lg:col-span-2 space-y-8">

          <KycSubmissionDetails kyc={kyc} />

          {/* Documents */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold">Documents</h3>
            <PhotoProvider>
              <div className="space-y-6">
                {kyc.proof_of_identity_document && (
                  <SimpleDocumentCard
                    title="Identity Document (Front)"
                    url={kyc.proof_of_identity_document.temporary_signed_url}
                    type={kyc.proof_of_identity_document.mime_type}
                  />
                )}
                {kyc.proof_of_identity_back_view && (
                  <SimpleDocumentCard
                    title="Identity Document (Back)"
                    url={kyc.proof_of_identity_back_view.temporary_signed_url}
                    type={kyc.proof_of_identity_back_view.mime_type}
                  />
                )}
                {kyc.face_image && (
                  <SimpleDocumentCard
                    title="Selfie / Face Image"
                    url={kyc.face_image.temporary_signed_url}
                    type={kyc.face_image.mime_type}
                  />
                )}
                {kyc.proof_of_address_document && (
                  <SimpleDocumentCard
                    title="Proof of Address"
                    url={kyc.proof_of_address_document.temporary_signed_url}
                    type={kyc.proof_of_address_document.mime_type}
                  />
                )}
                {kyc.proof_of_income_document && (
                  <SimpleDocumentCard
                    title="Proof of Income"
                    url={kyc.proof_of_income_document.temporary_signed_url}
                    type={kyc.proof_of_income_document.mime_type}
                  />
                )}
              </div>
            </PhotoProvider>
          </div>

          {/* Additional Documents (uploaded in response to a more-info request) */}
          {kyc.additional_documents && kyc.additional_documents.length > 0 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold">Additional Documents</h3>
              <PhotoProvider>
                <div className="space-y-6">
                  {kyc.additional_documents.map((ad) => (
                    <SimpleDocumentCard
                      key={ad.id}
                      title={ad.label || 'Additional Document'}
                      url={ad.document.temporary_signed_url}
                      type={ad.document.mime_type}
                    />
                  ))}
                </div>
              </PhotoProvider>
            </div>
          )}

          {/* Notes (Moved to Main Column) */}
          <Card>
            <CardHeader>
              <CardTitle>Admin Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
                {notes.length === 0 && <p className="text-sm text-muted-foreground text-center">No notes yet.</p>}
                {notes.map(note => (
                  <div key={note.id} className="bg-muted p-3 rounded-lg text-sm">
                    <p className="font-medium text-xs mb-1 flex justify-between">
                      <span>{note.author_name}</span>
                      <span className="text-muted-foreground">{formatDateToReadableShort(note.created_at)}</span>
                    </p>
                    <p>{note.content}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-2 pt-2 border-t">
                <Input
                  placeholder="Add a note..."
                  onFocus={() => setIsNoteDialogOpen(true)}
                  className="cursor-pointer"
                  readOnly
                />
              </div>
            </CardContent>
          </Card>

          {/* History */}
          <KycHistoryList history={history} />

          {/* Accepted Submissions */}
          <AcceptedKycsList submissions={accepted_submissions} />
        </div>

        {/* Right Column - User Info, Checklist, Actions */}
        <div className="space-y-8">

          {/* User Info Card */}
          <KycUserInfoCard
            user={{
              id: user.coffer_id,
              userId: user.id,
              name: `${user.first_name} ${user.last_name}`,
              email: user.email,
              avatar: user.avatar
            }}
            appliedAt={kyc.created_at}
            currentBand={user.account_tier || 'band_a'}
            requestingBand={kyc.associated_with}
            country={kyc.country || user.country}
            idType={kyc.proof_of_identity_type}
            dob={kyc.date_of_birth}
            idExpiry={kyc.expiry_date}
          />

          {/* Verification Checklist */}
          <Card>
            <CardHeader><CardTitle>Review Checklist</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {['Document is clear & readable', 'Information matches profile', 'Document is not expired', 'Face matches selfie'].map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input type="checkbox" className="h-4 w-4 rounded border-gray-300" />
                  <span>{item}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {kyc.status === 'pending' || kyc.status === 'under_review' || kyc.status === 'more_info_requested' ? (
                <>
                  <Button onClick={() => handleAction('approve')} disabled={kyc.status !== 'pending'} className="w-full bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="w-4 h-4 mr-2" /> Approve KYC
                  </Button>
                  <Button onClick={() => handleAction('reject')} disabled={kyc.status !== 'pending'} variant="destructive" className="w-full">
                    <XCircle className="w-4 h-4 mr-2" /> Reject KYC
                  </Button>
                  <Button onClick={() => handleAction('more_info')} disabled={kyc.status !== 'pending'} variant="outline" className="w-full">
                    <FileText className="w-4 h-4 mr-2" /> Request More Info
                  </Button>
                </>
              ) : (
                <div className="text-center p-4 bg-muted rounded-lg">
                  <p className="text-muted-foreground">This submission has been processed.</p>
                  <p className="font-medium capitalize mt-1 text-foreground">{kyc.status.replace(/_/g, ' ')}</p>
                </div>
              )}
            </CardContent>
          </Card>

        </div>
      </div>

      <KycActionDialog
        open={actionDialogOpen}
        onOpenChange={setActionDialogOpen}
        actionType={actionType}
        onSubmit={onActionSubmit}
        isSubmitting={isProcessing}
      />

      <AddAdminNoteDialog
        open={isNoteDialogOpen}
        onOpenChange={setIsNoteDialogOpen}
        onSubmit={handleSubmitNote}
        isSubmitting={isAddingNote}
      />
    </div>
  );
}
