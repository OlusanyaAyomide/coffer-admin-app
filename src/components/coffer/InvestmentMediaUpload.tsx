import { useId } from 'react';
import { FileText, ImageIcon, Loader2, Star, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import type { DocumentMetaData } from '@/types/GenericTypes';
import CloseToast from '@/components/shared/CloseToast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import useUploadRequest from '@/hooks/useUploadRequest';
import { cn } from '@/lib/utils';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024;

// Backend /upload returns the full DocumentMetaData row plus a signed URL.
type UploadedDocument = DocumentMetaData & {
  mime_type?: string;
  temporary_signed_url?: string | null;
};

export type InvestmentImage = { document_id: string; url: string | null };
export type InvestmentDocument = {
  upload_id: string;
  name: string;
  url?: string | null;
};

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type ImageGridProps = {
  images: Array<InvestmentImage>;
  onChange: (images: Array<InvestmentImage>) => void;
};

export function InvestmentImageGrid({ images, onChange }: ImageGridProps) {
  const inputId = useId();
  const { mutateAsync, isPending } = useUploadRequest<UploadedDocument>({
    requestUrl: '/upload',
  });

  const handleSelect = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) {
        toast.error('Only image files are allowed', { action: <CloseToast /> });
        continue;
      }
      if (file.size > MAX_IMAGE_BYTES) {
        toast.error('Each image must be 5 MB or smaller', {
          action: <CloseToast />,
        });
        continue;
      }
      const formData = new FormData();
      formData.append('file', file);
      try {
        const doc = await mutateAsync(formData);
        onChange([
          ...images,
          { document_id: doc.id, url: doc.temporary_signed_url ?? doc.url ?? null },
        ]);
      } catch {
        // useUploadRequest surfaces the error toast.
      }
    }
  };

  const removeAt = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const makePrimary = (index: number) => {
    if (index === 0) return;
    const next = [...images];
    const [picked] = next.splice(index, 1);
    onChange([picked, ...next]);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Images</Label>
        <span className="text-xs text-muted-foreground">
          First image is the cover
        </span>
      </div>

      <PhotoProvider>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((image, index) => (
          <div
            key={image.document_id}
            className="group relative aspect-video overflow-hidden rounded-md border border-border bg-muted"
          >
            {image.url ? (
              <PhotoView src={image.url}>
                <img
                  src={image.url}
                  alt=""
                  className="h-full w-full cursor-zoom-in object-cover"
                />
              </PhotoView>
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            {index === 0 && (
              <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                Cover
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-black/60 to-transparent p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              {index !== 0 && (
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  className="h-7 w-7"
                  onClick={() => makePrimary(index)}
                  aria-label="Make cover image"
                >
                  <Star className="h-3.5 w-3.5" />
                </Button>
              )}
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="h-7 w-7"
                onClick={() => removeAt(index)}
                aria-label="Remove image"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}

        <label
          htmlFor={inputId}
          className={cn(
            'flex aspect-video cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-border text-center transition-colors hover:border-primary/50 hover:bg-accent/50',
            isPending && 'pointer-events-none opacity-70',
          )}
        >
          {isPending ? (
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
          <span className="mt-1 text-xs text-muted-foreground">
            {isPending ? 'Uploading…' : 'Add image'}
          </span>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleSelect(e.target.files);
              e.target.value = '';
            }}
            disabled={isPending}
          />
        </label>
      </div>
      </PhotoProvider>
    </div>
  );
}

type DocumentListProps = {
  documents: Array<InvestmentDocument>;
  onChange: (documents: Array<InvestmentDocument>) => void;
};

export function InvestmentDocumentList({
  documents,
  onChange,
}: DocumentListProps) {
  const inputId = useId();
  const { mutateAsync, isPending } = useUploadRequest<UploadedDocument>({
    requestUrl: '/upload',
  });

  const handleSelect = async (files: FileList | null) => {
    if (!files?.length) return;
    for (const file of Array.from(files)) {
      if (file.size > MAX_DOCUMENT_BYTES) {
        toast.error('Each document must be 10 MB or smaller', {
          action: <CloseToast />,
        });
        continue;
      }
      const formData = new FormData();
      formData.append('file', file);
      try {
        const doc = await mutateAsync(formData);
        onChange([
          ...documents,
          {
            upload_id: doc.id,
            name: file.name.replace(/\.[^.]+$/, ''),
            url: doc.temporary_signed_url ?? doc.url ?? null,
          },
        ]);
      } catch {
        // useUploadRequest surfaces the error toast.
      }
    }
  };

  const removeAt = (index: number) => {
    onChange(documents.filter((_, i) => i !== index));
  };

  const renameAt = (index: number, name: string) => {
    onChange(documents.map((doc, i) => (i === index ? { ...doc, name } : doc)));
  };

  return (
    <div className="space-y-3">
      <Label>Documents (PDF)</Label>

      {documents.map((doc, index) => (
        <div
          key={doc.upload_id}
          className="flex items-center gap-3 rounded-md border border-border bg-card p-2.5"
        >
          <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            value={doc.name}
            onChange={(e) => renameAt(index, e.target.value)}
            placeholder="Document name"
            className="h-8"
          />
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => removeAt(index)}
            aria-label="Remove document"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}

      <label
        htmlFor={inputId}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-primary/50 hover:bg-accent/50',
          isPending && 'pointer-events-none opacity-70',
        )}
      >
        {isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Upload className="h-4 w-4" />
        )}
        {isPending ? 'Uploading…' : 'Add document'}
        <input
          id={inputId}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            handleSelect(e.target.files);
            e.target.value = '';
          }}
          disabled={isPending}
        />
      </label>
      <p className="text-xs text-muted-foreground">
        PDF up to 10 MB. Rename to match what investors see (e.g. “Investment
        Agreement”). {formatBytes(MAX_DOCUMENT_BYTES)} max.
      </p>
    </div>
  );
}
