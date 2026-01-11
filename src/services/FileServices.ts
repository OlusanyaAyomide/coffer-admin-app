import { fileTypeFromBuffer } from 'file-type';

import { FileMimeType, VerifyResult } from '@/types/GenericTypes';

export function formatFileSize(bytes: number): string {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = bytes;

  // Convert the size to the appropriate unit by dividing by 1024 until the size is less than 1024
  // or the highest unit (TB) is reached. Increment the unit index accordingly.
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(2)}${units[unitIndex]}`;
}

export function exceedsUploadSizeLimit(file: File | undefined, maxSizeInMegaByte: number): boolean {
  if (file === undefined) return false;

  // The size of 1MB in bytes
  const mbInBytes = 1048576;

  // Convert the filesize from bytes to MB
  const fileSizeMB = file.size / mbInBytes;

  // Check if the file size is not more that 5MB
  return fileSizeMB > maxSizeInMegaByte;
}

export function getMimeTypeFromUrl(url: string): string {
  const ext = url.split('.').pop()?.toLowerCase();
  const mimeMap: Record<string, string> = {
    pdf: 'application/pdf',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    mp4: 'video/mp4',
    mp3: 'audio/mpeg',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
  };
  return mimeMap[ext || ''] || 'application/octet-stream';
}

/**
 * Checks if a given URL points to an image
 * @param url The URL to check
 * @returns boolean indicating if the URL points to an image
 */
export function isImageUrl(url: string): boolean {
  // Remove query parameters and hash
  const cleanUrl = url.split('?')[0].split('#')[0];

  // Check for common image file extensions
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.bmp'];
  const isImageExtension = imageExtensions.some((ext) => cleanUrl.toLowerCase().endsWith(ext));

  if (isImageExtension) {
    return true;
  }
  // If no extension or not in our list, we can check the MIME type if available
  // This would require a HEAD request in a real implementation
  // For now, we'll return false for URLs without clear image extensions
  return false;
}

export async function verifyFileMagicNumber(file: File, allowedFileCategories: FileMimeType[] = ['image']): Promise<VerifyResult> {
  // Allowed file types configuration
  // NOTE: application type = document
  const ALLOWED_TYPES = {
    all: [
      'image/jpeg',
      'image/png',
      'image/heic',
      'image/heif',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
    image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'],
    application: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ],
  };

  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Get actual file type from file content
    const fileType = await fileTypeFromBuffer(uint8Array);

    if (!fileType) {
      return {
        isValid: false,
        error: 'Unable to determine file type. File may be corrupted or unsupported.',
      };
    }

    // Build list of allowed MIME types
    const allowedMimeTypes = allowedFileCategories.flatMap((cat) => ALLOWED_TYPES[cat] || []);

    // Verify against allowed types
    // Allowed types: ${allowedMimeTypes.join(', ')}
    if (!allowedMimeTypes.includes(fileType.mime)) {
      return {
        isValid: false,
        error: `File type ${fileType.mime} is not allowed. Please upload only supported image or document format`,
      };
    }

    // Check if extension matches MIME type
    // Allows images to be uploaded regardless of extension
    const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'heif', 'heic'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (
      (fileExtension && fileType.ext !== fileExtension)
      && (!imageExtensions.includes(fileExtension) || !fileType.mime.includes('image'))
    ) {
      return {
        isValid: false,
        error: `Warning: File extension .${fileExtension} doesn't match detected type .${fileType.ext}`,
      };
    }

    return {
      isValid: true,
      fileType,
    };
  } catch (error) {
    return {
      isValid: false,
      error: `Error validating file: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}
export function generateFilekey() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  const randomString = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');

  return randomString;
}

export function generateFileName(
  prefix: string,
  file: File,
): string {
  const now = new Date();

  const ext = file.name.split('.').pop() || '';

  const date = now.toISOString().split('T')[0];

  const timestamp = Date.now();

  return `${prefix}-${date}-${timestamp}.${ext}`;
}
