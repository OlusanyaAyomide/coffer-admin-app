'use client';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import type { QueryError } from '@/types/ResponseTypes';
import type { SlashStringType } from '@/types/GenericTypes';
import { normalizeApiErrors } from '@/services/errorServices';
import API from '@/services/api';
import CloseToast from '@/components/shared/CloseToast';

type ErrorStatus = 403 | 422;

type CustomError = {
  status: ErrorStatus;
  error: string;
};

type PostRequestType<T> = {
  isDelete?: boolean;
  isPut?: boolean;
  onError?: (error: QueryError) => void;
  onSuccess?: (data: T) => void;
  showErrorToast?: boolean;
  successText?: string;
  URL: SlashStringType;
  mutationKey?: Array<string>;
  customErrors?: Array<CustomError>;
  customToastDuration?: number;
};

/**
 * T - Data returned from mutation
 * G - Variables passed to mutate (request body)
 */
export default function usePostRequest<T, G>({
  isDelete = false,
  isPut = false,
  onError,
  onSuccess,
  showErrorToast = true,
  successText,
  URL,
  mutationKey,
  customErrors,
  customToastDuration,
}: PostRequestType<T>) {

  return useMutation<T, QueryError, G>({
    mutationFn: async (body) => {
      // Direct URL usage - removed workspace/appId prefixing
      const requestUrl = URL;

      let response;
      if (isPut) {
        response = await API.put(requestUrl, body);
      } else if (isDelete) {
        // Axios delete often takes data in a 'data' config property if needed
        response = await API.delete(requestUrl, { data: body });
      } else {
        response = await API.post(requestUrl, body);
      }
      return response.data;
    },
    mutationKey,
    onSuccess: (data) => {
      if (successText) {
        toast.dismiss();
        toast.success(successText, {
          action: <CloseToast />,
          duration: customToastDuration || undefined,
        });
      }
      if (onSuccess) {
        onSuccess(data);
      }
    },
    onError: (err) => {
      const errorStatusCode = err.status;
      const isErrorCustom = customErrors?.some((error) => error.status === errorStatusCode);

      if (customErrors && isErrorCustom && showErrorToast) {
        customErrors.forEach((customError) => {
          if (customError.status === errorStatusCode) {
            toast.error(customError.error, { action: <CloseToast /> });
          }
        });
      } else if (showErrorToast) {
        const toastErrors = normalizeApiErrors(err);
        toastErrors.forEach((item) => {
          toast.error(item, { action: <CloseToast /> });
        });
      }

      if (onError) {
        onError(err);
      }
    },
  });
}