import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Password reset API wrappers.
 *
 * Both endpoints are fully public — no JWT required.
 *
 * The `forgot` endpoint always returns 200 regardless of whether the email
 * exists, to prevent email enumeration. The `reset` endpoint returns 400 if
 * the token is invalid or expired.
 */
export const passwordResetApi = {
  /**
   * Initiate a password reset by sending a reset email.
   * Always resolves (200) — never reveals whether the email is registered.
   * Rate-limited per email address server-side.
   */
  forgot: (body: ForgotPasswordRequest): Promise<void> =>
    httpClient.post("/v1/iam/users/password/forgot", body).then(() => undefined),

  /**
   * Complete a password reset using the single-use token from the email link.
   * Returns 400 if the token is invalid or expired.
   */
  reset: (body: ResetPasswordRequest): Promise<void> =>
    httpClient.post("/v1/iam/users/password/reset", body).then(() => undefined),
};
