import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { RefreshTokenResponse } from '@/types/AuthTypes';
import usePostRequest from '@/hooks/usePostRequests';
import { beginRefreshGate, endRefreshGate } from '@/services/api';
import {
  clearAuthCookies,
  getCookieExpiryTime,
  getRefreshToken,
  setSplitAuthToken,
} from '@/services/CookiesServices';

type RefreshTokenPayload = { refresh_token: string };

const CHECK_INTERVAL_MS = 1 * 60 * 1000; // check every 1 minute
const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // refresh when ≤ 5 min to expiry
const MAX_RETRY_ERRORS = 3;

/**
 * Proactive admin token refresh: every minute, if the access token has ≤5 min
 * to expiry, rotate it via `/admin/user/refresh-token`. While the refresh is in
 * flight the axios refresh gate holds every other request so none fire with a
 * stale token. After repeated failures the admin is logged out to `/login`.
 * Mount once in the authenticated `_admin` layout.
 */
export default function useTokenRefresh() {
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);
  const errorCountRef = useRef(0);

  const { mutate: refreshToken } = usePostRequest<RefreshTokenResponse, RefreshTokenPayload>({
    URL: '/admin/user/refresh-token',
    showErrorToast: false,
    onSuccess: (response) => {
      errorCountRef.current = 0;
      isRefreshingRef.current = false;
      endRefreshGate();
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
      endRefreshGate();
      errorCountRef.current += 1;
      if (errorCountRef.current >= MAX_RETRY_ERRORS) {
        clearAuthCookies();
        navigate({ to: '/login' });
      }
    },
  });

  const refreshTokenRef = useRef(refreshToken);
  useEffect(() => {
    refreshTokenRef.current = refreshToken;
  }, [refreshToken]);

  useEffect(() => {
    const checkAndRefresh = () => {
      if (isRefreshingRef.current) return;

      const expiryTimeStr = getCookieExpiryTime();
      const refreshTokenValue = getRefreshToken();
      if (!expiryTimeStr || !refreshTokenValue) return;

      const timeUntilExpiry = new Date(expiryTimeStr).getTime() - Date.now();
      if (timeUntilExpiry <= REFRESH_THRESHOLD_MS) {
        isRefreshingRef.current = true;
        beginRefreshGate();
        refreshTokenRef.current({ refresh_token: refreshTokenValue });
      }
    };

    checkAndRefresh(); // check immediately on mount
    intervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
