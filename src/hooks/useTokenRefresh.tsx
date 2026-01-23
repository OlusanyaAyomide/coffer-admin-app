import { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { RefreshTokenResponse } from '@/types/AuthTypes';
import usePostRequest from '@/hooks/usePostRequests';
import { clearAuthCookies, getCookieExpiryTime, getRefreshToken, setSplitAuthToken } from '@/services/CookiesServices';

type RefreshTokenPayload = {
  refresh_token: string;
};

const CHECK_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ERRORS = 3;
const MIN_RETRY_DELAY_MS = 20000; // Minimum 20 seconds between retries

export default function useTokenRefresh() {
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorCountRef = useRef(0);
  // Guard to prevent multiple simultaneous refresh calls
  const isRefreshingRef = useRef(false);
  // Track if initial check has run (prevents double-call in Strict Mode)
  const hasInitialCheckRun = useRef(false);

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const handleLogout = useCallback(() => {
    clearAllTimers();
    clearAuthCookies();
    isRefreshingRef.current = false;
    navigate({ to: '/login' });
  }, [clearAllTimers, navigate]);

  const scheduleRetry = useCallback((timeUntilExpiry: number) => {
    // Clear any existing retry timeout
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    // Schedule retry at half the remaining time, with a minimum delay
    const retryDelay = Math.max(Math.floor(timeUntilExpiry / 2), MIN_RETRY_DELAY_MS);

    retryTimeoutRef.current = setTimeout(() => {
      const refreshTokenValue = getRefreshToken();
      if (refreshTokenValue && !isRefreshingRef.current) {
        isRefreshingRef.current = true;
        refreshToken({ refresh_token: refreshTokenValue });
      }
    }, retryDelay);
  }, []);

  const { mutate: refreshToken } = usePostRequest<RefreshTokenResponse, RefreshTokenPayload>({
    URL: '/admin/user/refresh-token',
    showErrorToast: false,
    onSuccess: (response) => {
      errorCountRef.current = 0;
      isRefreshingRef.current = false;
      setSplitAuthToken(
        response.data.token.access_token,
        response.data.token.access_token_expiry,
        'access'
      );
      setSplitAuthToken(
        response.data.token.refresh_token,
        response.data.token.refresh_token_expiry,
        'refresh'
      );
    },
    onError: () => {
      isRefreshingRef.current = false;
      errorCountRef.current += 1;

      // After 3 errors, logout the user
      if (errorCountRef.current >= MAX_RETRY_ERRORS) {
        handleLogout();
        return;
      }

      // Schedule retry at half the remaining time
      const expiryTimeStr = getCookieExpiryTime();
      if (expiryTimeStr) {
        const expiryTime = new Date(expiryTimeStr).getTime();
        const timeUntilExpiry = expiryTime - Date.now();

        if (timeUntilExpiry > 0) {
          scheduleRetry(timeUntilExpiry);
        } else {
          // Token already expired, logout
          handleLogout();
        }
      } else {
        handleLogout();
      }
    },
  });

  useEffect(() => {
    const checkAndRefresh = () => {
      // Prevent duplicate calls if already refreshing
      if (isRefreshingRef.current) {
        return;
      }

      const expiryTimeStr = getCookieExpiryTime();
      const refreshTokenValue = getRefreshToken();

      if (!expiryTimeStr || !refreshTokenValue) {
        return;
      }

      const expiryTime = new Date(expiryTimeStr).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;
      console.log(timeUntilExpiry < REFRESH_THRESHOLD_MS)

      // If token expires in less than threshold, refresh it
      if (timeUntilExpiry > 0 && timeUntilExpiry < REFRESH_THRESHOLD_MS) {
        isRefreshingRef.current = true;
        setTimeout(() => {
          refreshToken({ refresh_token: refreshTokenValue });
        }, 1000)
      }
    };

    // Guard against React Strict Mode double mounting
    if (!hasInitialCheckRun.current) {
      hasInitialCheckRun.current = true;
      checkAndRefresh();
    }

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    // Cleanup all timers on unmount
    return () => {
      clearAllTimers();
      // Reset the initial check flag on unmount so it runs again if remounted
      hasInitialCheckRun.current = false;
    };
  }, [refreshToken, clearAllTimers]);
}
