import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'

import { getAccessToken } from '@/services/CookiesServices'
import { isRecoverableAuthError } from '@/services/authErrors'

declare module 'axios' {
  export interface AxiosRequestConfig {
    /** Marks a request already replayed once after a refresh. */
    _retriedAfterRefresh?: boolean
  }
}

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
})

// --- Refresh gate -----------------------------------------------------------
// While a token refresh is in flight, every other request waits on this promise
// before attaching its Authorization header, so nothing fires with a token
// that's about to be rotated. The refresh request itself (URL contains
// `refresh-token`) bypasses the gate to avoid a deadlock.
let refreshGate: Promise<void> | null = null
let resolveGate: (() => void) | null = null

export function beginRefreshGate(): void {
  if (refreshGate) return
  refreshGate = new Promise<void>((resolve) => {
    resolveGate = resolve
  })
}

export function endRefreshGate(): void {
  resolveGate?.()
  refreshGate = null
  resolveGate = null
}

// The proactive poll runs every 60s against a 15-minute access token, so an
// idle tab can wake and fire a request with an already-expired token. Injected
// by useTokenRefresh rather than imported, since that hook imports from here.
type RefreshFn = () => Promise<boolean>

let performRefresh: RefreshFn | null = null

export function registerRefreshHandler(fn: RefreshFn | null): void {
  performRefresh = fn
}

let inFlightRefresh: Promise<boolean> | null = null

// Single-flight, so concurrent 401s share one refresh instead of stampeding.
function refreshOnce(): Promise<boolean> {
  if (!performRefresh) return Promise.resolve(false)
  inFlightRefresh ??= performRefresh().finally(() => {
    inFlightRefresh = null
  })
  return inFlightRefresh
}

// Use an interceptor to dynamically add the access token
API.interceptors.request.use(
  async (config) => {
    const isRefresh = config.url?.includes('refresh-token')
    if (refreshGate && !isRefresh) {
      await refreshGate
    }

    const token = getAccessToken() // Fetch the latest access token from cookies
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

API.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as AxiosRequestConfig | undefined
    const isRefresh = config?.url?.includes('refresh-token')

    // Only an expired access token is retryable. A revoked session, and every
    // 403, falls through untouched — 403 is authorisation, not authentication.
    if (
      !config ||
      isRefresh ||
      config._retriedAfterRefresh ||
      !isRecoverableAuthError(error)
    ) {
      return Promise.reject(error)
    }

    const refreshed = await refreshOnce()
    if (!refreshed) return Promise.reject(error)

    config._retriedAfterRefresh = true
    return API.request(config)
  },
)

export default API
