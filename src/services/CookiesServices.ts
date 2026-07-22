import Cookies from 'js-cookie'

import type { UserAuthResponse } from '@/types/AuthTypes'

/* --- Token cookie keys --- */
const ACC_KEYS = ['A8b3fC2', '7m5nZt4', 'h9p0rG1']
const REF_KEYS = ['287a3jG', '51b896e', 'f3c402d']

/* --- Helpers --- */
function splitToken(token: string): Array<string> {
  const partLength = Math.floor(token.length / 3)
  return [
    token.slice(0, partLength),
    token.slice(partLength, partLength * 2),
    token.slice(partLength * 2),
  ]
}

function setTokenCookie(name: string, value: string, expiryDays: number) {
  Cookies.set(name, value, { secure: true, expires: expiryDays })
}

export function setSplitAuthToken(
  token: string,
  expirySeconds: number,
  type: 'access' | 'refresh',
) {
  const tokenArr = splitToken(token)
  const keys = type === 'access' ? ACC_KEYS : REF_KEYS
  const expiryDays = expirySeconds / 86400 // convert seconds to days

  tokenArr.forEach((part, i) => setTokenCookie(keys[i], part, expiryDays))
}

/* --- Generic cookie setter --- */
export function setCookie(name: string, value: string, expiryDays?: number) {
  const options = expiryDays
    ? { secure: true, expires: expiryDays }
    : { secure: true }
  Cookies.set(name, value, options)
}

/* --- Set auth cookies --- */
export function setAuthCookies(res: UserAuthResponse) {
  const { token, user } = res

  // Set split access & refresh tokens
  setSplitAuthToken(token.access_token, token.access_token_expiry, 'access')
  setSplitAuthToken(token.refresh_token, token.refresh_token_expiry, 'refresh')

  // Set basic user info
  setCookie('user_id', user.user_id)
  setCookie('userEmail', user.email)
  setCookie('country_id', user.country_id)
  if (user.first_name) setCookie('first_name', user.first_name)
  if (user.last_name) setCookie('last_name', user.last_name)

  setAccessTokenExpiry(token.access_token_expiry)
}

/**
 * Records when the current access token dies AND how long it was granted for.
 *
 * Both are needed. `expires_in` answers "is it dead yet"; `access_lifetime`
 * answers "how long does one of these last", which is what the refresh
 * threshold needs in order to scale with whatever the server issues rather than
 * assuming a fixed 15 minutes.
 *
 * MUST be called on every refresh, not just login. It previously only ran in
 * setAuthCookies, so after the first refresh `expires_in` stayed frozen at the
 * original deadline — `timeUntilExpiry` then sat permanently below the
 * threshold and the dashboard refreshed on every 60s tick, indefinitely.
 */
export function setAccessTokenExpiry(expirySeconds: number) {
  const expiryDate = new Date(Date.now() + expirySeconds * 1000)
  setCookie('expires_in', expiryDate.toISOString())
  setCookie('access_lifetime', String(expirySeconds))
}

/** Seconds the server granted the current access token, or 0 when unknown. */
export function getAccessTokenLifetime(): number {
  return Number(Cookies.get('access_lifetime')) || 0
}

/* --- Getters --- */
export function getAccessToken(): string | undefined {
  // Return undefined during SSR (no document available)

  const [a, b, c] = ACC_KEYS.map((k) => Cookies.get(k))
  return a && b && c ? a + b + c : undefined
}

export function getRefreshToken(): string | undefined {
  const [a, b, c] = REF_KEYS.map((k) => Cookies.get(k))
  return a && b && c ? a + b + c : undefined
}

export function getUserID(): string | undefined {
  return Cookies.get('user_id')
}

export function getUserEmail(): string | undefined {
  return Cookies.get('userEmail')
}

export function getCookieExpiryTime(): string | undefined {
  return Cookies.get('expires_in')
}

/* --- Clear all auth & workspace cookies --- */
export function clearAuthCookies() {
  ;[...ACC_KEYS, ...REF_KEYS].forEach((k) => Cookies.remove(k))
  ;[
    'user_id',
    'userEmail',
    'first_name',
    'last_name',
    'workspaceName',
    'workspaceRole',
    'workspaceLogo',
    'expires_in',
    'access_lifetime',
    'registration_token',
  ].forEach((k) => Cookies.remove(k))
}

export function setRegistrationToken(token: string, expiryDate?: string) {
  const options = expiryDate
    ? { secure: true, expires: new Date(expiryDate) }
    : { secure: true }
  Cookies.set('registration_token', token, options)
}

export function getRegistrationToken(): string | undefined {
  return Cookies.get('registration_token')
}

export function getCookie(name: string): string | undefined {
  return Cookies.get(name)
}
