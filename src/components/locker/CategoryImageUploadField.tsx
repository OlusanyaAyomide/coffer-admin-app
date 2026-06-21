import {
  useEffect,
  useId,
  useRef,
  useState,
} from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import CloseToast from '@/components/shared/CloseToast';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import useCloudinaryUpload, {
  getCloudinaryUploadFolder,
} from '@/hooks/useCloudinaryUpload';
import { cn } from '@/lib/utils';

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const RASTER_IMAGE_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
]);

type CategoryImageUploadFieldProps = {
  value: string;
  onChange: (url: string) => void;
  onClear: VoidFunction;
  label?: string;
  entityName?: string;
  folderSuffix?: string;
};

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function validateImage(file: File) {
  if (!RASTER_IMAGE_TYPES.has(file.type)) {
    return 'Upload a PNG, JPG, JPEG, GIF, or WebP image. SVG is reserved for icons.';
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return 'Maximum category image size is 5 MB.';
  }

  return null;
}

export default function CategoryImageUploadField({
  value,
  onChange,
  onClear,
  label = 'Category image',
  entityName = 'category image',
  folderSuffix = 'image',
}: CategoryImageUploadFieldProps) {
  const inputId = useId();
  const replaceInputId = `${inputId}-replace`;
  const [isDragging, setIsDragging] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const dragCounter = useRef(0);
  const { isPending: isUploading, uploadInfo, uploadToCloudinary } =
    useCloudinaryUpload({
      onError: () => {
        setPendingFile(null);
      },
    });

  useEffect(() => {
    if (!pendingFile) {
      setPreviewUrl('');
      return;
    }

    const objectUrl = URL.createObjectURL(pendingFile);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [pendingFile]);

  const uploadFile = async (file: File) => {
    const validationError = validateImage(file);
    if (validationError) {
      toast.error(validationError, { action: <CloseToast /> });
      return;
    }

    setPendingFile(file);

    try {
      const result = await uploadToCloudinary({
        file,
        folder: getCloudinaryUploadFolder(folderSuffix),
      });
      onChange(result.secure_url);
      toast.success(`${label} uploaded`, { action: <CloseToast /> });
    } catch {
      // useCloudinaryUpload owns the user-facing error toast.
    } finally {
      setPendingFile(null);
    }
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    await uploadFile(file);
    event.target.value = '';
  };

  const handleDrop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const file = event.dataTransfer.files?.[0];
    if (file) {
      await uploadFile(file);
    }
  };

  const displayUrl = previewUrl || value;
  const hasImage = Boolean(displayUrl);

  return (
    <div className="space-y-3">
      <Label>{label}</Label>

      {hasImage ? (
        <div className="rounded-lg border border-border bg-card p-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="h-24 w-full overflow-hidden rounded-md border border-border bg-muted sm:w-36">
              <img
                src={displayUrl}
                alt=""
                className={cn(
                  'h-full w-full object-cover',
                  isUploading && 'opacity-60',
                )}
              />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground">
                {pendingFile?.name || `Uploaded ${entityName}`}
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG, JPEG, GIF, or WebP. SVG is reserved for icons.
              </p>
              {pendingFile ? (
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatFileSize(pendingFile.size)}
                  {isUploading && uploadInfo ? ` · ${uploadInfo.progress}%` : ''}
                </p>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                asChild
                disabled={isUploading}
              >
                <label htmlFor={replaceInputId} className="cursor-pointer">
                  Replace
                </label>
              </Button>
              <input
                id={replaceInputId}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onClear}
                disabled={isUploading}
              aria-label={`Remove ${entityName}`}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragEnter={(event) => {
            event.preventDefault();
            dragCounter.current += 1;
            setIsDragging(true);
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            dragCounter.current -= 1;
            if (dragCounter.current === 0) setIsDragging(false);
          }}
          onDragOver={(event) => {
            event.preventDefault();
          }}
          onDrop={handleDrop}
          className={cn(
            'flex h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/50',
            isUploading && 'pointer-events-none opacity-70',
          )}
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-border bg-muted">
            {isUploading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : (
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <p className="text-sm font-medium text-foreground">
            {isUploading
              ? `Uploading ${uploadInfo?.progress ?? 0}%`
                : `Upload ${entityName}`}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {isDragging ? 'Drop image here' : 'Click or drag and drop to upload'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            PNG, JPG, JPEG, GIF, or WebP up to 5 MB.
          </p>
          <Upload className="mt-3 h-4 w-4 text-muted-foreground" />
          <input
            id={inputId}
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/gif,image/webp"
            className="hidden"
            onChange={handleUpload}
            disabled={isUploading}
          />
        </label>
      )}
    </div>
  );
}
