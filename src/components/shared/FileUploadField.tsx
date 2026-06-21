import {
  useEffect, useMemo, useRef, useState,
} from 'react';
import { toast } from 'sonner';
import { Upload } from 'lucide-react';
import CloseToast from './CloseToast';
import RequiredLabel from './RequiredLabel';
import type { ChangeEvent, DragEvent} from 'react';
import type {
  FieldValues, Path, PathValue,
  UseFormSetValue,
} from 'react-hook-form';

import type { AxiosResponse } from 'axios';
import type {
  DocumentMetaData,
  FileMimeType,
  NullableType,
  SlashStringType,
} from '@/types/GenericTypes';
import {
  exceedsUploadSizeLimit,
  formatFileSize,
  generateFileName,
  getMimeTypeFromUrl,
  verifyFileMagicNumber,
} from '@/services/FileServices';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import useUploadRequest from '@/hooks/useUploadRequest';
import SvgIcons from '@/icons/SvgIcon';
import { returnDataOrNull } from '@/services/emptyDataServices';


type FileUploadFieldProp<T extends FieldValues, K extends Path<T> = Path<T>> = {
  fieldName: K;
  setValue: UseFormSetValue<T>;
  error?: string;
  uploadTitle: string;
  uploadDescription: string;
  extraContext?: string;
  maxSizeInMegaByte: number;
  mediaType: FileMimeType;
  isRequired?: boolean;
  value: NullableType<DocumentMetaData>;
  className?: string;
  filePreviewClassName?: string;
  replaceText?: string;
  prefix: string;
  showBorderOnMobile?: boolean;
  uploadUrl?: SlashStringType;
  additionalFormData?: Record<string, string>;
  accept?: string;
  mapUploadResponse?: (
    data: unknown,
    file: File,
  ) => DocumentMetaData;
  onUploadSuccess?: (metadata: DocumentMetaData) => void;
  onFileDelete?: VoidFunction;
};

type FileType = {
  file: File;
  metadata?: DocumentMetaData;
};

export default function FileUploadField<T extends FieldValues>({
  fieldName,
  setValue,
  value,
  error,
  uploadTitle,
  uploadDescription,
  extraContext,
  mediaType,
  maxSizeInMegaByte,
  className,
  isRequired = true,
  filePreviewClassName,
  replaceText = 'Replace',
  prefix,
  showBorderOnMobile,
  uploadUrl,
  additionalFormData,
  accept,
  mapUploadResponse,
  onUploadSuccess,
  onFileDelete,
}: FileUploadFieldProp<T>) {
  const initialFile = useMemo(() => {
    const verifiedValue = returnDataOrNull(value);
    if (!verifiedValue) {
      return null;
    }

    return {
      file: new File([], verifiedValue.name, { type: getMimeTypeFromUrl(verifiedValue.url) }),
      metadata: verifiedValue,
    };
  }, [value]);

  const [uploadedFile, setUploadedFile] = useState<FileType | null>(initialFile);
  const [isReuploading, setIsReUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragCounter = useRef(0);
  const pendingFileRef = useRef<File | null>(null);

  const {
    mutate: uploadFile,
    isPending,
    uploadInfo,
    cancelUpload,
  } = useUploadRequest<AxiosResponse<DocumentMetaData>>({
    requestUrl: uploadUrl,
    onError: () => {
      setUploadedFile(null);
      pendingFileRef.current = null;
      setValue(fieldName, '' as PathValue<T, Path<T>>);
    },
    onSuccess: (data) => {
      const file = pendingFileRef.current ?? uploadedFile?.file ?? new File([], 'Uploaded file');
      const metadata = mapUploadResponse
        ? mapUploadResponse(data, file)
        : {
          key: data.data.key,
          name: data.data.name,
          size: data.data.size,
          url: data.data.url,
          id: data.data.id,
        };
      setValue(fieldName, metadata as PathValue<T, Path<T>>);
      setUploadedFile({ file, metadata });
      pendingFileRef.current = null;
      setIsReUploading(false);
      onUploadSuccess?.(metadata);
    },
  });

  // Sync uploadedFile with value changes
  useEffect(() => {
    const verifiedValue = returnDataOrNull(value);
    if (verifiedValue && !isPending) {
      setUploadedFile({
        file: new File([], verifiedValue.name, { type: getMimeTypeFromUrl(verifiedValue.url) }),
        metadata: verifiedValue,
      });
    }
  }, [value, isPending]);

  const handleImageDelete = () => {
    setUploadedFile(null);
    if (isPending) {
      cancelUpload();
    }
    pendingFileRef.current = null;
    setValue(fieldName, null as PathValue<T, Path<T>>);
    onFileDelete?.();
  };

  const { UploadPreview, DocumentUpload } = SvgIcons;

  const processFile = async (file: File, isReupload?: boolean) => {
    const verification = await verifyFileMagicNumber(file, [mediaType]);

    if (!verification.isValid) {
      toast.error(verification.error || 'Uploaded file type is not valid', {
        action: <CloseToast />,
      });
      return;
    }

    if (exceedsUploadSizeLimit(file, maxSizeInMegaByte)) {
      toast.error(`Maximum file size is ${maxSizeInMegaByte} MB`, {
        action: <CloseToast />,
      });
      return;
    }

    setUploadedFile({ file });
    pendingFileRef.current = file;
    if (isReupload) {
      setIsReUploading(true);
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('prefix', prefix);
    formData.append('name', generateFileName(prefix, file));
    Object.entries(additionalFormData ?? {}).forEach(([key, value]) => {
      formData.append(key, value);
    });

    uploadFile(formData);
  };

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>, isReupload?: boolean) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    await processFile(file, isReupload);

    // Reset input
    e.target.value = '';
  };

  const handleDragEnter = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;

    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;

    if (dragCounter.current === 0) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  const shouldShowFile = uploadedFile !== null;

  if (uploadedFile && (shouldShowFile || isReuploading)) {
    return (
      <div
        className={cn(
          'flex sm:items-center mb-4 max-sm:mt-2 md:col-span-2 gap-4 pb-3 border-b border-border',
          filePreviewClassName,
        )}
      >
        <UploadPreview className="h-5 w-5 shrink-0 text-foreground" />
        <div className="flex sm:items-center gap-2 sm:justify-between max-sm:flex-col grow">
          <h3 className="font-medium text-foreground leading-[16px]">
            {uploadedFile.file.name}
          </h3>
          <div className="flex items-center gap-3">
            {uploadInfo?.progress ? (
              <span className="whitespace-nowrap text-sm text-muted-foreground">
                {uploadInfo.progress}%
              </span>
            ) : null}
            <div className="h-[20px] px-2 flex items-center border border-border rounded">
              <span className="text-[11px] text-muted-foreground">
                {formatFileSize(Number(uploadedFile.metadata?.size) || uploadedFile.file.size)}
              </span>
            </div>
            <label
              className="h-6 cursor-pointer text-primary hover:text-primary/80 transition-colors font-medium text-sm"
              htmlFor={fieldName}
              aria-label={`Upload files for ${fieldName}`}
            >
              {replaceText}
            </label>
            <input
              accept={accept ?? (mediaType === 'all' ? 'image/*, application/*' : `${mediaType}/*`)}
              onChange={(e) => {
                handleUpload(e, true);
              }}
              disabled={isPending}
              id={fieldName}
              type="file"
              data-testid="input-file"
              className="hidden"
            />
            <Button
              onClick={handleImageDelete}
              variant="ghost"
              className="px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
              disabled={isPending}
            >
              Delete
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <label
        htmlFor={fieldName}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={cn(
          'mb-4 h-[205px] relative rounded-lg cursor-pointer p-4 flex flex-col items-center justify-center mt-3 w-full transition-all',
          'border-2 border-dashed',
          isDragging
            ? 'border-primary bg-primary/5 scale-[0.98]'
            : error
              ? 'border-destructive bg-destructive/5'
              : 'border-border hover:border-primary/50 hover:bg-accent/50',
          showBorderOnMobile && 'max-sm:border-dashed',
          className,
        )}
      >
        <DocumentUpload className="shrink-0 text-muted-foreground mb-3 h-12 w-12" />
        {isRequired ? (
          <RequiredLabel className="font-medium my-2 text-foreground text-center">
            {uploadTitle}
          </RequiredLabel>
        ) : (
          <h3 className="font-medium my-2 text-foreground text-center">{uploadTitle}</h3>
        )}
        <h3 className="text-center mb-2">
          <span className="text-primary mr-2 leading-[21px] font-medium">
            {isDragging ? 'Drop file here' : 'Click here'}
          </span>
          <span className="text-muted-foreground">
            {isDragging ? '' : 'or drag and drop to upload'}
          </span>
        </h3>
        <p className="text-muted-foreground text-xs max-w-[444px] text-center">
          {uploadDescription}
        </p>
        {extraContext ? (
          <p className="text-muted-foreground text-xs max-w-[444px] text-center mt-1">
            {extraContext}
          </p>
        ) : null}
        <input
          accept={accept ?? (mediaType === 'all' ? 'image/*, application/*' : `${mediaType}/*`)}
          onChange={handleUpload}
          data-testid="input-file"
          id={fieldName}
          type="file"
          className="hidden"
          disabled={isPending}
        />
        {error ? (
          <span className="text-destructive text-sm absolute -bottom-5 left-2">{error}</span>
        ) : null}
      </label>

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 rounded-lg bg-primary/10 border-2 border-primary border-dashed flex items-center justify-center pointer-events-none z-10 animate-in fade-in duration-200">
          <div className="flex flex-col items-center gap-3 bg-background/95 backdrop-blur-sm px-8 py-6 rounded-lg shadow-lg border border-primary/20">
            <div className="relative">
              <Upload className="h-16 w-16 text-primary animate-bounce" strokeWidth={1.5} />
              <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
            </div>
            <p className="text-lg font-semibold text-primary">Drop your file here</p>
            <p className="text-sm text-muted-foreground">Release to upload</p>
          </div>
        </div>
      )}
    </div>
  );
}
