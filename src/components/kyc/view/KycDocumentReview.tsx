
import { Download, FileText, RotateCw, ZoomIn } from 'lucide-react';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
import type { DocumentTab } from './KycViewPage';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DocumentInfo {
  url: string;
  title: string;
}

interface KycDocumentReviewProps {
  activeTab: DocumentTab;
  onTabChange: (tab: DocumentTab) => void;
  currentDocument?: DocumentInfo;
  onViewDocument: () => void;
  isImageUrl: (url?: string) => boolean;
}

const tabs: Array<{ id: DocumentTab; label: string }> = [
  { id: 'passport', label: 'Passport' },
  { id: 'selfie', label: 'Selfie' },
  { id: 'address_proof', label: 'Address Proof' },
];

export default function KycDocumentReview({
  activeTab,
  onTabChange,
  currentDocument,
  onViewDocument,
  isImageUrl,
}: KycDocumentReviewProps) {
  const handleDownload = () => {
    if (currentDocument?.url) {
      const link = document.createElement('a');
      link.href = currentDocument.url;
      link.download = currentDocument.title.replace(/\s+/g, '_');
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const isImage = currentDocument?.url && isImageUrl(currentDocument.url);

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold">Document Review</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Verify identity documents and approve or reject KYC submission
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={onViewDocument}
            title="Zoom"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Refresh"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={handleDownload}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Document Preview Area */}
      {isImage ? (
        <PhotoProvider>
          <PhotoView src={currentDocument.url}>
            <div className="relative aspect-video rounded-lg bg-secondary/50 mb-4 cursor-pointer overflow-hidden">
              <img
                src={currentDocument.url}
                alt={currentDocument.title}
                className="w-full h-full object-contain"
              />
            </div>
          </PhotoView>
        </PhotoProvider>
      ) : (
        <div
          className="relative aspect-video rounded-lg bg-secondary/50 mb-4 cursor-pointer overflow-hidden"
          onClick={onViewDocument}
        >
          <div className="w-full h-full flex flex-col items-center justify-center gap-3">
            <div className="p-4 rounded-xl bg-muted/50">
              <FileText className="h-12 w-12 text-muted-foreground/50" />
            </div>
            <span className="text-sm text-muted-foreground">
              {currentDocument?.title || 'No document available'}
            </span>
          </div>
        </div>
      )}

      {/* Document Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeTab === tab.id ? 'default' : 'secondary'}
            size="sm"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              'rounded-full',
              activeTab !== tab.id && 'bg-secondary/50 text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </Button>
        ))}
      </div>
    </div>
  );
}
