'use client';

import { useNavigate } from '@tanstack/react-router';
import { History, FileText, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import type { KycHistoryItem, KycDocumentField } from '@/types/UserTypes';
import { formatDateToReadable } from '@/services/TimeServices';
import { cn } from '@/lib/utils';
import TransitionLink from '@/components/layout/TransitionLink';

interface KycHistoryListProps {
  history: KycHistoryItem[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'accepted': return 'bg-green-100 text-green-700 border-green-200';
    case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
    case 'pending': return 'bg-orange-100 text-orange-700 border-orange-200';
    case 'more_info_requested': return 'bg-blue-100 text-blue-700 border-blue-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

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

export default function KycHistoryList({ history }: KycHistoryListProps) {

  if (!history || history.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" /> Submission History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-6">
            <PhotoProvider>
              {history.map((item) => (
                <div key={item.id} className="flex flex-col gap-3 pb-6 border-b last:border-0 last:pb-0">
                  {/* Header: Status + Date + View Button */}
                  <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-1">
                      <Badge variant="outline" className={cn("w-fit capitalize", getStatusColor(item.status))}>
                        {item.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{formatDateToReadable(item.created_at)}</span>
                    </div>
                    <TransitionLink to={`/kyc/${item.id}`}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                      >
                        <Eye className="w-3 h-3 mr-2" /> View Details
                      </Button>
                    </TransitionLink>
                  </div>

                  {/* Reason / Info */}
                  {item.rejection_reason && (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100">
                      <span className="font-semibold">Reason:</span> {item.rejection_reason}
                    </div>
                  )}
                  {(item.additional_info_requested || item.text_content) && (
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded-md border border-blue-100">
                      <span className="font-semibold">Info:</span> {item.additional_info_requested || item.text_content}
                    </div>
                  )}

                  {/* Snapshots */}
                  <div className="flex gap-2 flex-wrap">
                    <SnapshotThumbnail doc={item.proof_of_identity_document} title="Identity Document" />
                    <SnapshotThumbnail doc={item.proof_of_identity_back_view} title="Identity Back" />
                    <SnapshotThumbnail doc={item.face_image} title="Face Image" />
                    <SnapshotThumbnail doc={item.proof_of_address_document} title="Proof of Address" />
                    <SnapshotThumbnail doc={item.proof_of_income_document} title="Proof of Income" />
                  </div>
                </div>
              ))}
            </PhotoProvider>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
