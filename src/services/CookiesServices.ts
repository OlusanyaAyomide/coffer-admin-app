import Cookies from 'js-cookie';

import type { UserAuthResponse } from '@/types/AuthTypes';


/* --- Token cookie keys --- */
const ACC_KEYS = ['A8b3fC2', '7m5nZt4', 'h9p0rG1'];
const REF_KEYS = ['287a3jG', '51b896e', 'f3c402d'];

/* --- Helpers --- */
function splitToken(token: string): Array<string> {
  const partLength = Math.floor(token.length / 3);
  return [
    token.slice(0, partLength),
    token.slice(partLength, partLength * 2),
    token.slice(partLength * 2),
  ];
}

function setTokenCookie(name: string, value: string, expiryDays: number) {
  Cookies.set(name, value, { secure: true, expires: expiryDays });
}

function setSplitAuthToken(token: string, expirySeconds: number, type: 'access' | 'refresh') {
  const tokenArr = splitToken(token);
  const keys = type === 'access' ? ACC_KEYS : REF_KEYS;
  const expiryDays = expirySeconds / 86400; // convert seconds to days

  tokenArr.forEach((part, i) => setTokenCookie(keys[i], part, expiryDays));
}

/* --- Generic cookie setter --- */
export function setCookie(name: string, value: string, expiryDays?: number) {
  const options = expiryDays ? { secure: true, expires: expiryDays } : { secure: true };
  Cookies.set(name, value, options);
}

/* --- Set auth cookies --- */
export function setAuthCookies(res: UserAuthResponse) {
  const { token, user } = res;

  // Set split access & refresh tokens
  setSplitAuthToken(token.access_token, token.access_token_expiry, 'access');
  setSplitAuthToken(token.refresh_token, token.refresh_token_expiry, 'refresh');

  // Set basic user info
  setCookie('user_id', user.user_id);
  setCookie('userEmail', user.email);
  setCookie('first_name', user.first_name);
  setCookie('last_name', user.last_name);

  // Set token expiry date as ISO string
  const expiryDate = new Date(Date.now() + token.access_token_expiry * 1000);
  setCookie('expires_in', expiryDate.toISOString());
}


/* --- Getters --- */
export function getAccessToken(): string | undefined {
  const [a, b, c] = ACC_KEYS.map(k => Cookies.get(k));
  return a && b && c ? a + b + c : undefined;
}

export function getRefreshToken(): string | undefined {
  const [a, b, c] = REF_KEYS.map(k => Cookies.get(k));
  return a && b && c ? a + b + c : undefined;
}

export function getUserID(): string | undefined {
  return Cookies.get('user_id');
}

export function getUserEmail(): string | undefined {
  return Cookies.get('userEmail');
}

export function getCookieExpiryTime(): string | undefined {
  return Cookies.get('expires_in');
}

/* --- Clear all auth & workspace cookies --- */
export function clearAuthCookies() {
  [...ACC_KEYS, ...REF_KEYS].forEach(k => Cookies.remove(k));
  ['user_id', 'userEmail', 'first_name', 'last_name', 'workspaceName', 'workspaceRole', 'workspaceLogo', 'expires_in', 'registration_token']
    .forEach(k => Cookies.remove(k));
}

export function setRegistrationToken(token: string, expiryDate?: string) {
  const options = expiryDate ? { secure: true, expires: new Date(expiryDate) } : { secure: true };
  Cookies.set('registration_token', token, options);
}

export function getRegistrationToken(): string | undefined {
  return Cookies.get('registration_token');
}
