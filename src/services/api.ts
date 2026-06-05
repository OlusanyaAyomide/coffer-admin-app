import axios from 'axios';

import { getAccessToken } from '@/services/CookiesServices';



const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  },
});

// --- Refresh gate -----------------------------------------------------------
// While a token refresh is in flight, every other request waits on this promise
// before attaching its Authorization header, so nothing fires with a token
// that's about to be rotated. The refresh request itself (URL contains
// `refresh-token`) bypasses the gate to avoid a deadlock.
let refreshGate: Promise<void> | null = null;
let resolveGate: (() => void) | null = null;

export function beginRefreshGate(): void {
  if (refreshGate) return;
  refreshGate = new Promise<void>((resolve) => {
    resolveGate = resolve;
  });
}

export function endRefreshGate(): void {
  resolveGate?.();
  refreshGate = null;
  resolveGate = null;
}

// Use an interceptor to dynamically add the access token
API.interceptors.request.use(
  async (config) => {
    const isRefresh = config.url?.includes('refresh-token');
    if (refreshGate && !isRefresh) {
      await refreshGate;
    }

    const token = getAccessToken(); // Fetch the latest access token from cookies
    if (token) {

      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default API;
