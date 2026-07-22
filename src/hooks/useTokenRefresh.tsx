import { useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import type { RefreshTokenResponse } from '@/types/AuthTypes'
import usePostRequest from '@/hooks/usePostRequests'
import API, {
  beginRefreshGate,
  endRefreshGate,
  registerRefreshHandler,
} from '@/services/api'
import { isRefreshRejected } from '@/services/authErrors'
import {
  clearAuthCookies,
  getAccessTokenLifetime,
  getCookieExpiryTime,
  getRefreshToken,
  setAccessTokenExpiry,
  setSplitAuthToken,
} from '@/services/CookiesServices'

type RefreshTokenPayload = { refresh_token: string }

const CHECK_INTERVAL_MS = 1 * 60 * 1000 // check every 1 minute
const MAX_RETRY_ERRORS = 3

// Refresh once this fraction of the token's life remains. A third of a
// 15-minute token is 5 minutes, so behaviour is unchanged for today's config —
// but it now follows whatever the server issues instead of assuming.
const REFRESH_AT_REMAINING_FRACTION = 1 / 3

// Never act on a window shorter than the check interval, or the whole window
// could fall between two ticks and be missed.
const MIN_REFRESH_THRESHOLD_MS = 45 * 1000

// Used only when the stored lifetime is unknown — sessions that logged in
// before `access_lifetime` existed, until their next refresh.
const FALLBACK_REFRESH_THRESHOLD_MS = 5 * 60 * 1000

// Derived from the lifetime the SERVER granted. Was a hardcoded 5 minutes,
// which silently assumed ACCESS_TOKEN_EXPIRATION is '15m' — shorten that
// constant and the fixed threshold becomes longer than the token's entire life,
// so every tick would refresh.
function refreshThresholdMs(lifetimeSeconds: number): number {
  if (!lifetimeSeconds) return FALLBACK_REFRESH_THRESHOLD_MS
  return Math.max(
    Math.floor(lifetimeSeconds * REFRESH_AT_REMAINING_FRACTION * 1000),
    MIN_REFRESH_THRESHOLD_MS,
  )
}

/**
 * Proactive admin token refresh: every minute, if the access token is within a
 * third of its life from expiring, rotate it via `/admin/user/refresh-token`.
 * While the refresh is in flight the axios refresh gate holds every other
 * request so none fire with a stale token. After repeated failures the admin is
 * logged out to `/login`. Mount once in the authenticated `_admin` layout.
 */
export default function useTokenRefresh() {
  const navigate = useNavigate()
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isRefreshingRef = useRef(false)
  const errorCountRef = useRef(0)
  const inFlightRef = useRef<Promise<boolean> | null>(null)

  const { mutate: refreshToken } = usePostRequest<
    RefreshTokenResponse,
    RefreshTokenPayload
  >({
    URL: '/admin/user/refresh-token',
    showErrorToast: false,
    onSuccess: (response) => {
      errorCountRef.current = 0
      isRefreshingRef.current = false
      endRefreshGate()
      setSplitAuthToken(
        response.data.token.access_token,
        response.data.token.access_token_expiry,
        'access',
      )
      setSplitAuthToken(
        response.data.token.refresh_token,
        response.data.token.refresh_token_expiry,
        'refresh',
      )
      // Without this the expiry cookie keeps the deadline set at LOGIN, so
      // every later tick still sees the token as nearly expired and refreshes
      // again — once a minute, forever.
      setAccessTokenExpiry(response.data.token.access_token_expiry)
    },
    onError: (error) => {
      isRefreshingRef.current = false
      endRefreshGate()

      // An explicitly rejected token is over immediately — retrying cannot help.
      if (isRefreshRejected(error)) {
        clearAuthCookies()
        navigate({ to: '/login' })
        return
      }

      // Transient: a deploy, a blip, a timeout. The refresh token is still
      // valid, so keep the session and try again on the next tick. This used to
      // count EVERY failure toward the logout threshold, so three minutes of
      // server trouble signed the admin out — which fixes nothing for them,
      // since they cannot log back in either while the server is down.
      errorCountRef.current += 1
      if (errorCountRef.current >= MAX_RETRY_ERRORS) {
        console.warn(
          `[useTokenRefresh] ${errorCountRef.current} consecutive transient refresh failures`,
        )
      }
    },
  })

  const refreshTokenRef = useRef(refreshToken)
  useEffect(() => {
    refreshTokenRef.current = refreshToken
  }, [refreshToken])

  // Reactive path, driven by the response interceptor on a 401/TOKEN_EXPIRED.
  // The proactive timer above cannot cover a tab that has been idle past the
  // access token's life — its first request on waking would 401 and bounce the
  // admin to /login. Uses API.post directly because the interceptor needs a
  // promise it can await before replaying the original request, which the
  // mutation's fire-and-forget `mutate` cannot give it.
  useEffect(() => {
    const runRefresh = async (): Promise<boolean> => {
      const refreshTokenValue = getRefreshToken()
      if (!refreshTokenValue) return false

      isRefreshingRef.current = true
      beginRefreshGate()
      try {
        const response = await API.post<RefreshTokenResponse>(
          '/admin/user/refresh-token',
          { refresh_token: refreshTokenValue },
        )
        const { token } = response.data.data

        setSplitAuthToken(
          token.access_token,
          token.access_token_expiry,
          'access',
        )
        setSplitAuthToken(
          token.refresh_token,
          token.refresh_token_expiry,
          'refresh',
        )
        setAccessTokenExpiry(token.access_token_expiry)
        errorCountRef.current = 0
        return true
      } catch (error) {
        // Mirror the proactive path. A bare catch here swallowed a genuine
        // rejection too, leaving the admin authenticated-in-name-only: every
        // request would 401, refresh would silently fail, and nothing would
        // ever send them to /login.
        if (isRefreshRejected(error)) {
          clearAuthCookies()
          navigate({ to: '/login' })
        }
        return false
      } finally {
        endRefreshGate()
        isRefreshingRef.current = false
      }
    }

    // Single-flight. Concurrent 401s must await the SAME refresh and receive
    // its real result — a second caller that returned early with `false` would
    // tell the interceptor a live refresh had failed, dropping a request that
    // was about to succeed.
    const performRefresh = (): Promise<boolean> => {
      inFlightRef.current ??= runRefresh().finally(() => {
        inFlightRef.current = null
      })
      return inFlightRef.current
    }

    registerRefreshHandler(performRefresh)
    return () => registerRefreshHandler(null)
  }, [])

  useEffect(() => {
    const checkAndRefresh = () => {
      if (isRefreshingRef.current) return

      const expiryTimeStr = getCookieExpiryTime()
      const refreshTokenValue = getRefreshToken()
      if (!expiryTimeStr || !refreshTokenValue) return

      const timeUntilExpiry = new Date(expiryTimeStr).getTime() - Date.now()
      if (timeUntilExpiry <= refreshThresholdMs(getAccessTokenLifetime())) {
        isRefreshingRef.current = true
        beginRefreshGate()
        refreshTokenRef.current({ refresh_token: refreshTokenValue })
      }
    }

    checkAndRefresh() // check immediately on mount
    intervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])
}
