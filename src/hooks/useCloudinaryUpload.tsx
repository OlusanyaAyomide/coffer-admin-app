import { useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';

import CloseToast from '@/components/shared/CloseToast';

export type CloudinaryUploadInfo = {
  progress: number;
  size: number;
} | null;

export type CloudinaryResponse = {
  public_id: string;
  secure_url: string;
  original_filename: string;
  bytes: number;
  format: string;
  resource_type: 'image';
};

type CloudinaryUploadParams = {
  file: File;
  uploadKey?: string;
  folder?: string;
};

type CloudinaryProp = {
  onError?: VoidFunction;
};

const cloudinaryCloudName = (
  import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ||
  import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME
) as string | undefined;

const cloudinaryUploadPreset = (
  import.meta.env.VITE_UPLOAD_PRESET ||
  import.meta.env.PUBLIC_UPLOAD_PRESET ||
  import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ||
  import.meta.env.PUBLIC_CLOUDINARY_UPLOAD_PRESET
) as string | undefined;

const defaultCloudinaryFolder =
  (import.meta.env.VITE_CLOUDINARY_FOLDER ||
    import.meta.env.PUBLIC_CLOUDINARY_FOLDER) ??
  'coffer/locker/categories';

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, '');
}

export function getCloudinaryUploadFolder(suffix?: string) {
  const baseFolder = trimSlashes(String(defaultCloudinaryFolder));
  if (!suffix) return baseFolder;
  return `${baseFolder}/${trimSlashes(suffix)}`;
}

function assertCloudinaryConfig() {
  if (!cloudinaryCloudName || !cloudinaryUploadPreset) {
    throw new Error(
      'Cloudinary upload is not configured. Set VITE_CLOUDINARY_CLOUD_NAME and VITE_UPLOAD_PRESET, or their PUBLIC_ equivalents.',
    );
  }
}

export default function useCloudinaryUpload({ onError }: CloudinaryProp = {}) {
  const [uploadInfo, setUploadInfo] = useState<CloudinaryUploadInfo>(null);
  const abortController = useRef<AbortController | null>(null);

  const { isPending, data, mutateAsync } = useMutation<
    CloudinaryResponse,
    AxiosError | Error,
    CloudinaryUploadParams
  >({
    mutationFn: async ({ file, uploadKey, folder }) => {
      assertCloudinaryConfig();

      abortController.current = new AbortController();

      const uploadData = new FormData();
      uploadData.append('file', file, file.name);
      uploadData.append('upload_preset', cloudinaryUploadPreset as string);
      uploadData.append('folder', folder || getCloudinaryUploadFolder());

      if (uploadKey) {
        uploadData.append('public_id', uploadKey);
      }

      const response = await axios.post<CloudinaryResponse>(
        `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/upload`,
        uploadData,
        {
          onUploadProgress(progressEvent) {
            const percentCompleted = Math.round(
              (progressEvent.progress || 0) * 100,
            );
            const fileSize = file.size / (1024 * 1024);
            const roundedSize = Math.round(fileSize * 100) / 100;

            setUploadInfo({
              progress: percentCompleted,
              size: roundedSize,
            });
          },
          signal: abortController.current.signal,
        },
      );

      return response.data;
    },
    mutationKey: ['cloudinary-upload'],
    onSuccess: () => {
      setUploadInfo(null);
    },
    onError: (error) => {
      setUploadInfo(null);
      toast.error(
        error instanceof Error
          ? error.message
          : 'File upload could not be completed',
        { action: <CloseToast /> },
      );
      onError?.();
    },
  });

  return {
    isPending,
    data,
    uploadInfo,
    uploadToCloudinary: mutateAsync,
    abortController,
  };
}
