// import { useCallback, useEffect, useRef } from 'react';
// import { useNavigate } from '@tanstack/react-router';
// import type { RefreshTokenResponse } from '@/types/AuthTypes';
// import usePostRequest from '@/hooks/usePostRequests';
// import { clearAuthCookies, getCookieExpiryTime, getRefreshToken, setSplitAuthToken } from '@/services/CookiesServices';

// type RefreshTokenPayload = {
//   refresh_token: string;
// };

// const CHECK_INTERVAL_MS = 1 * 60 * 1000; // 1 minute
// const REFRESH_THRESHOLD_MS = 5 * 60 * 1000; // 5 minutes
// const MAX_RETRY_ERRORS = 3;
// const MIN_RETRY_DELAY_MS = 20000; // Minimum 20 seconds between retries

// export default function useTokenRefresh() {
//   const navigate = useNavigate();
//   const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
//   const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
//   const errorCountRef = useRef(0);
//   // Guard to prevent multiple simultaneous refresh calls
//   const isRefreshingRef = useRef(false);
//   // Track if initial check has run (prevents double-call in Strict Mode)
//   const hasInitialCheckRun = useRef(false);

//   const clearAllTimers = useCallback(() => {
//     if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//       intervalRef.current = null;
//     }
//     if (retryTimeoutRef.current) {
//       clearTimeout(retryTimeoutRef.current);
//       retryTimeoutRef.current = null;
//     }
//   }, []);

//   const handleLogout = useCallback(() => {
//     clearAllTimers();
//     clearAuthCookies();
//     isRefreshingRef.current = false;
//     navigate({ to: '/login' });
//   }, [clearAllTimers, navigate]);

//   const scheduleRetry = useCallback((timeUntilExpiry: number) => {
//     // Clear any existing retry timeout
//     if (retryTimeoutRef.current) {
//       clearTimeout(retryTimeoutRef.current);
//     }

//     // Schedule retry at half the remaining time, with a minimum delay
//     const retryDelay = Math.max(Math.floor(timeUntilExpiry / 2), MIN_RETRY_DELAY_MS);

//     retryTimeoutRef.current = setTimeout(() => {
//       const refreshTokenValue = getRefreshToken();
//       if (refreshTokenValue && !isRefreshingRef.current) {
//         isRefreshingRef.current = true;
//         refreshToken({ refresh_token: refreshTokenValue });
//       }
//     }, retryDelay);
//   }, []);

//   const { mutate: refreshToken } = usePostRequest<RefreshTokenResponse, RefreshTokenPayload>({
//     URL: '/admin/user/refresh-token',
//     showErrorToast: false,
//     onSuccess: (response) => {
//       errorCountRef.current = 0;
//       isRefreshingRef.current = false;
//       setSplitAuthToken(
//         response.data.token.access_token,
//         response.data.token.access_token_expiry,
//         'access'
//       );
//       setSplitAuthToken(
//         response.data.token.refresh_token,
//         response.data.token.refresh_token_expiry,
//         'refresh'
//       );
//     },
//     onError: () => {
//       isRefreshingRef.current = false;
//       errorCountRef.current += 1;

//       // After 3 errors, logout the user
//       if (errorCountRef.current >= MAX_RETRY_ERRORS) {
//         handleLogout();
//         return;
//       }

//       // Schedule retry at half the remaining time
//       const expiryTimeStr = getCookieExpiryTime();
//       if (expiryTimeStr) {
//         const expiryTime = new Date(expiryTimeStr).getTime();
//         const timeUntilExpiry = expiryTime - Date.now();

//         if (timeUntilExpiry > 0) {
//           scheduleRetry(timeUntilExpiry);
//         } else {
//           // Token already expired, logout
//           handleLogout();
//         }
//       } else {
//         handleLogout();
//       }
//     },
//   });

//   // Store latest versions of functions in refs to avoid re-running effect
//   const refreshTokenRef = useRef(refreshToken);
//   const handleLogoutRef = useRef(handleLogout);

//   // Update refs when functions change
//   useEffect(() => {
//     refreshTokenRef.current = refreshToken;
//     handleLogoutRef.current = handleLogout;
//   }, [refreshToken, handleLogout]);

//   useEffect(() => {
//     const checkAndRefresh = () => {
//       // Prevent duplicate calls if already refreshing
//       if (isRefreshingRef.current) {
//         return;
//       }

//       const expiryTimeStr = getCookieExpiryTime();
//       const refreshTokenValue = getRefreshToken();

//       if (!expiryTimeStr || !refreshTokenValue) {
//         return;
//       }

//       const expiryTime = new Date(expiryTimeStr).getTime();
//       const now = Date.now();
//       const timeUntilExpiry = expiryTime - now;
//       const timeUntilRefreshTrigger = timeUntilExpiry - REFRESH_THRESHOLD_MS;

//       console.log('🔔 TIME UNTIL REFRESH TRIGGERS:', Math.max(0, timeUntilRefreshTrigger / 60000).toFixed(2), 'minutes');
//       console.log('⏱️  Time until cookie expires:', (timeUntilExpiry / 60000).toFixed(2), 'minutes');
//       console.log('📊 Refresh threshold (buffer):', (REFRESH_THRESHOLD_MS / 60000).toFixed(2), 'minutes');

//       // If token expires in less than threshold, refresh it
//       if (timeUntilExpiry < REFRESH_THRESHOLD_MS && timeUntilExpiry > 0) {
//         isRefreshingRef.current = true;
//         console.log("🔄 REFRESH TRIGGERED! Token expires in", (timeUntilExpiry / 60000).toFixed(2), 'minutes');
//         refreshTokenRef.current({ refresh_token: refreshTokenValue });
//       } else if (timeUntilExpiry <= 0) {
//         isRefreshingRef.current = true;
//         refreshTokenRef.current({ refresh_token: refreshTokenValue });
//         // Token already expired
//         console.log("❌ Token already expired, logging out");
//         // handleLogoutRef.current();
//       } else {
//         // Token is still valid and not in refresh window
//         console.log(`✅ Token valid. Refresh in ~${Math.max(0, timeUntilRefreshTrigger / 60000).toFixed(2)} minutes (when ${(REFRESH_THRESHOLD_MS / 60000).toFixed(2)} min remain)`);
//       }
//     };

//     // Guard against React Strict Mode double mounting
//     if (!hasInitialCheckRun.current) {
//       hasInitialCheckRun.current = true;
//       checkAndRefresh();
//     }

//     // Set up interval for periodic checks
//     intervalRef.current = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

//     // Cleanup all timers on unmount
//     return () => {
//       clearAllTimers();
//       // Reset the initial check flag on unmount so it runs again if remounted
//       hasInitialCheckRun.current = false;
//     };
//   }, []); // Empty dependency array - only runs once on mount
// }

import { useEffect, useRef } from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { RefreshTokenResponse } from '@/types/AuthTypes';
import usePostRequest from '@/hooks/usePostRequests';
import {
  clearAuthCookies,
  getRefreshToken,
  setSplitAuthToken,
  setCookie,
  getCookie
} from '@/services/CookiesServices';

type RefreshTokenPayload = {
  refresh_token: string;
};

const REFRESH_INTERVAL_MS = 7 * 60 * 1000; // Always refresh every 7 minutes
const LAST_REFRESH_COOKIE = 'last_token_refresh';

export default function useTokenRefresh() {
  const navigate = useNavigate();
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isRefreshingRef = useRef(false);

  const { mutate: refreshToken } = usePostRequest<RefreshTokenResponse, RefreshTokenPayload>({
    URL: '/admin/user/refresh-token',
    showErrorToast: false,
    onSuccess: (response) => {
      isRefreshingRef.current = false;

      // Update tokens
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

      // Track when we last refreshed
      setCookie(LAST_REFRESH_COOKIE, Date.now().toString());

      console.log('✅ Token refreshed successfully');
    },
    onError: () => {
      isRefreshingRef.current = false;
      console.log('❌ Token refresh failed, logging out');
      clearAuthCookies();
      navigate({ to: '/login' });
    },
  });

  useEffect(() => {
    const performRefresh = () => {
      if (isRefreshingRef.current) {
        console.log('⏭️  Refresh already in progress, skipping');
        return;
      }

      const refreshTokenValue = getRefreshToken();
      if (!refreshTokenValue) {
        console.log('❌ No refresh token found');
        return;
      }

      isRefreshingRef.current = true;
      console.log('🔄 Refreshing token...');
      refreshToken({ refresh_token: refreshTokenValue });
    };

    const checkAndScheduleRefresh = () => {
      const lastRefreshStr = getCookie(LAST_REFRESH_COOKIE);
      const now = Date.now();

      if (lastRefreshStr) {
        const lastRefresh = parseInt(lastRefreshStr, 10);
        const timeSinceLastRefresh = now - lastRefresh;
        const timeUntilNextRefresh = REFRESH_INTERVAL_MS - timeSinceLastRefresh;

        console.log(`⏱️  Time since last refresh: ${(timeSinceLastRefresh / 60000).toFixed(2)} minutes`);
        console.log(`🔔 Next refresh in: ${(timeUntilNextRefresh / 60000).toFixed(2)} minutes`);

        // If it's been more than 5 minutes, refresh immediately
        if (timeSinceLastRefresh >= REFRESH_INTERVAL_MS) {
          console.log('⚡ Refresh needed immediately');
          performRefresh();
        }
      } else {
        // No previous refresh recorded, do it now
        console.log('🆕 First refresh - executing now');
        performRefresh();
      }
    };

    // Check immediately on mount
    checkAndScheduleRefresh();

    // Set up interval to refresh every 5 minutes
    intervalRef.current = setInterval(performRefresh, REFRESH_INTERVAL_MS);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []); // Empty deps - only runs once on mount
}