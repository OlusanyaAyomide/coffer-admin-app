'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from '@tanstack/react-router';
import usePostRequest from '@/hooks/usePostRequests';
import { getRefreshToken, getCookieExpiryTime, setAuthCookies, clearAuthCookies } from '@/services/CookiesServices';
import type { UserAuthApiResponse } from '@/types/AuthTypes';

type RefreshTokenPayload = {
  refresh_token: string;
};

const CHECK_INTERVAL_MS = 3 * 60 * 1000; // 3 minutes
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRY_ERRORS = 3;
const MIN_RETRY_DELAY_MS = 5000; // Minimum 5 seconds between retries

export default function useTokenRefresh() {
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorCountRef = useRef(0);

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
      if (refreshTokenValue) {
        refreshToken({ refresh_token: refreshTokenValue });
      }
    }, retryDelay);
  }, []);

  const { mutate: refreshToken } = usePostRequest<UserAuthApiResponse, RefreshTokenPayload>({
    URL: '/user/refresh-token',
    showErrorToast: false,
    onSuccess: (response) => {
      ``
      errorCountRef.current = 0;
      setAuthCookies(response.data);
    },
    onError: () => {
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
      const expiryTimeStr = getCookieExpiryTime();
      const refreshTokenValue = getRefreshToken();

      if (!expiryTimeStr || !refreshTokenValue) {
        return;
      }

      const expiryTime = new Date(expiryTimeStr).getTime();
      const now = Date.now();
      const timeUntilExpiry = expiryTime - now;

      // If token expires in less than 5 minutes, refresh it
      if (timeUntilExpiry > 0 && timeUntilExpiry < REFRESH_THRESHOLD_MS) {
        refreshToken({ refresh_token: refreshTokenValue });
      }
    };

    // Initial check
    checkAndRefresh();

    // Set up interval for periodic checks
    intervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    // Cleanup all timers on unmount
    return () => {
      clearAllTimers();
    };
  }, [refreshToken, clearAllTimers]);
}
