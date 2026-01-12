'use client';

import {
  focusManager,
  useIsMutating,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { AxiosError } from 'axios';

import type { ApiVersionType, SlashStringType } from '@/types/GenericTypes';
import API from '@/services/api';

type GetRequestType = {
  queryKey: Array<string>;
  apiVersion?: ApiVersionType;
  URL: SlashStringType;
  enabled?: boolean;
  params?: Record<string, string | number | boolean | Array<string> | Array<number>>;
};

// G → error type
// T → response data type
export default function useGetRequest<T, G>({
  queryKey,
  URL,
  enabled = true,
  params,
}: GetRequestType) {

  const queryKeys = [
    ...queryKey,
    ...(params ? [params] : []),
  ];

  const mutationCount = useIsMutating({ mutationKey: ['refresh-token'] });
  const isRefreshing = mutationCount > 0;

  const queryClient = useQueryClient();

  focusManager.setEventListener((handleFocus) => {
    if (typeof window === 'undefined') return;

    const visibilitychangeHandler = () => {
      const isVisible = document.visibilityState === 'visible';
      handleFocus(isVisible);

      if (isVisible) {
        queryClient
          .getQueryCache()
          .getAll()
          .forEach((query) => {
            if (query.state.status === 'error') {
              queryClient.invalidateQueries({ queryKey: query.queryKey });
            }
          });
      }
    };

    window.addEventListener('visibilitychange', visibilitychangeHandler);
    return () => {
      window.removeEventListener('visibilitychange', visibilitychangeHandler);
    };
  });

  return useQuery<T, AxiosError<G>>({
    queryKey: queryKeys,
    enabled: !isRefreshing && enabled,

    queryFn: async () => {
      // workspacePrefix logic is fully removed; URL is used as provided
      const requestUrl = URL;

      const response = await API.get(requestUrl, { params });

      if (!response.data || (typeof response.data === 'object' && !Object.keys(response.data).length)) {
        throw new Error('Invalid or empty response returned');
      }

      return response.data as T;
    },
  });
}