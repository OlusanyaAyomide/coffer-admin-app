import { isAxiosError } from 'axios'

/**
 * Mirrors `AuthErrorCode` on the API (`src/auth/auth.errors.ts`). Keep in step.
 *
 * The server used to answer every auth failure with an identical, message-less
 * 401, so the dashboard could only guess what had happened — and guessed
 * "bounce to /login".
 */
export enum AuthErrorCode {
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  SESSION_REVOKED = 'SESSION_REVOKED',
  TOKEN_SUPERSEDED = 'TOKEN_SUPERSEDED',
  TOKEN_INVALID = 'TOKEN_INVALID',
  BIOMETRIC_TOKEN_INVALID = 'BIOMETRIC_TOKEN_INVALID',
  REFRESH_TOKEN_INVALID = 'REFRESH_TOKEN_INVALID',
}

/** Reads `error_code` off an API error payload, if the server sent one. */
export function getAuthErrorCode(error: unknown): AuthErrorCode | undefined {
  if (!isAxiosError(error)) return undefined
  const code = (error.response?.data as { error_code?: string } | undefined)
    ?.error_code
  return code && code in AuthErrorCode ? (code as AuthErrorCode) : undefined
}

/**
 * Whether a failure means the admin must sign in again.
 *
 * Deliberately narrow:
 *  - 403 is NEVER a session failure. The API uses it for authorisation — an
 *    admin hitting a route their role doesn't cover, or any business-rule
 *    denial. Treating it as a dead session turned "you can't do that" into
 *    "you've been logged out".
 *  - TOKEN_EXPIRED is recoverable: the interceptor refreshes and retries.
 */
export function isSessionEndedError(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  if (error.response?.status !== 401) return false
  return getAuthErrorCode(error) !== AuthErrorCode.TOKEN_EXPIRED
}

/**
 * Whether a FAILED REFRESH means the credential is genuinely dead, as opposed
 * to the request merely not getting through.
 *
 * Only an explicit rejection ends a session. A dropped connection, a 502 during
 * a deploy, a 500, a timeout — all leave the refresh token valid; we just failed
 * to spend it. Treating any failure as a dead session is how a server restart
 * signs out every admin at once.
 */
export function isRefreshRejected(error: unknown): boolean {
  if (!isAxiosError(error)) return false

  const status = error.response?.status
  if (!status) return false // nothing came back
  if (status >= 500) return false // server unwell, not our credential
  if (status === 408 || status === 429) return false // explicitly retryable

  if (getAuthErrorCode(error)) {
    return (
      getAuthErrorCode(error) === AuthErrorCode.REFRESH_TOKEN_INVALID ||
      getAuthErrorCode(error) === AuthErrorCode.BIOMETRIC_TOKEN_INVALID
    )
  }

  // Older API build with no code: refresh rejects a bad token with 400, the
  // guard with 401.
  return status === 400 || status === 401
}

/** Whether a 401 can be resolved by refreshing the access token. */
export function isRecoverableAuthError(error: unknown): boolean {
  return (
    isAxiosError(error) &&
    error.response?.status === 401 &&
    getAuthErrorCode(error) === AuthErrorCode.TOKEN_EXPIRED
  )
}
