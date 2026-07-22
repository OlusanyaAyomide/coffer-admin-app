'use client'

import { useState } from 'react'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useRouter } from '@tanstack/react-router'

import { RETRY_TIME, STALE_TIME_IN_MS } from '@/constants/Constants'
import { isSessionEndedError } from '@/services/authErrors'
import { clearAuthCookies } from '@/services/CookiesServices'

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // Use TanStack Router's useRouter hook
  const router = useRouter()

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: STALE_TIME_IN_MS,
            refetchOnWindowFocus: false,
            retry: RETRY_TIME,
          },
        },
        queryCache: new QueryCache({
          onError: (error) => {
            // Was `401 || 403`. But 403 is authorisation, not authentication —
            // an admin opening a route their role doesn't cover, or any
            // business-rule denial, was reported as a logout rather than a
            // permission error. An expired-but-renewable token is handled by
            // the response interceptor and never reaches here.
            if (!isSessionEndedError(error)) return

            // Clear before navigating, or the stale cookies survive the bounce
            // and the next request reuses a dead token.
            clearAuthCookies()
            router.navigate({ to: '/login' as string })
          },
        }),
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
