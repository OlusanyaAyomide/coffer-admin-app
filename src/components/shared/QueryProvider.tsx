'use client';

import { useState } from 'react';
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useRouter } from '@tanstack/react-router';
import { isAxiosError } from 'axios';

import { RETRY_TIME, STALE_TIME_IN_MS } from '@/constants/Constants';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Use TanStack Router's useRouter hook
  const router = useRouter();

  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: STALE_TIME_IN_MS,
        refetchOnWindowFocus: false,
        retry: RETRY_TIME,
      },
    },
    queryCache: new QueryCache({
      onError: (error) => {
        if (
          isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          // TanStack Router navigation
          router.navigate({ to: '/login' as string });
        }
      },
    }),
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}