import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useRef, useState } from 'react'

import type { QueryError } from '@/types/ResponseTypes'
import { normalizeApiErrors } from '@/services/errorServices'
import API from '@/services/api'
import CloseToast from '@/components/shared/CloseToast'
import type { SlashStringType } from '@/types/GenericTypes'

type UploadRequestType<T> = {
  onError?: (error: QueryError) => void
  onSuccess?: (data: T) => void
  showErrorToast?: boolean
  successText?: string
  mutationKey?: Array<string>
  requestUrl?: SlashStringType
}

type UploadProgress = {
  progress: number
  loaded: number
  total: number
}

type ApiEnvelope<T> = {
  success?: boolean
  data?: T
}

function unwrapUploadResponse<T>(payload: T | ApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as ApiEnvelope<T>).data !== undefined
  ) {
    return (payload as ApiEnvelope<T>).data as T
  }

  return payload as T
}

export default function useUploadRequest<T>({
  onError,
  onSuccess,
  showErrorToast = true,
  successText,
  mutationKey,
  requestUrl = '/upload/public',
}: UploadRequestType<T>) {
  const [uploadInfo, setUploadInfo] = useState<UploadProgress | null>(null)
  const abortController = useRef<AbortController | null>(null)

  const mutation = useMutation<T, QueryError, FormData>({
    mutationFn: async (formData) => {
      // Create new abort controller for this upload
      abortController.current = new AbortController()

      const response = await API.post(requestUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        signal: abortController.current.signal,
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            )
            setUploadInfo({
              progress,
              loaded: progressEvent.loaded,
              total: progressEvent.total,
            })
          }
        },
      })

      return unwrapUploadResponse<T>(response.data)
    },
    mutationKey,
    onSuccess: (data) => {
      setUploadInfo(null)
      if (successText) {
        toast.dismiss()
        toast.success(successText, { action: <CloseToast /> })
      }
      if (onSuccess) {
        onSuccess(data)
      }
    },
    onError: (err) => {
      setUploadInfo(null)

      // Don't show error toast if upload was aborted
      if (err.message === 'canceled') {
        return
      }

      if (showErrorToast) {
        const toastErrors = normalizeApiErrors(err)
        toastErrors.forEach((item) => {
          toast.error(item, { action: <CloseToast /> })
        })
      }

      if (onError) {
        onError(err)
      }
    },
  })

  const cancelUpload = () => {
    if (abortController.current) {
      abortController.current.abort()
      setUploadInfo(null)
    }
  }

  return {
    ...mutation,
    uploadInfo,
    cancelUpload,
    abortController,
  }
}
