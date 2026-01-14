import type { FileTypeResult } from "file-type";

export type InputType = 'password' | 'email' | 'text' | 'number' | 'date';

export type NullableType<T> = T | null | Record<string, never> | undefined;

export type SlashStringType = `/${string}`;

export type ApiVersionType = 1 | 2 | 3;

export type DocumentMetaData = {
  id: string
  name: string
  size: string
  url: string
  uploaded_at?: string
  key?: string
};

export type ComboboxContent = {
  label: string,
  value: string,
  sub_label?: string;
  image_url?: string;
  meta?: Record<string, string>
};

export type FileMimeType = 'all' | 'image' | 'application';

export type VerifyResult = {
  isValid: boolean;
  error?: string;
  fileType?: FileTypeResult;
};