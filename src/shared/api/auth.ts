import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Auth API wrappers for sign-in and sign-out.
 *
 * Uses the dedicated platform admin sign-in endpoint (`POST /v1/iam/auth/admin/signin`)
 * which requires no X-Tenant-ID header and loads authorities exclusively from
 * `user_platform_roles`. Returns 403 if the user has no platform-level roles.
 *
 * The silent-refresh endpoint (`POST /v1/iam/auth/refresh`) is intentionally
 * excluded here — it is handled exclusively by `auth-interceptor.ts` to ensure
 * deduplication of concurrent refresh calls and correct retry behaviour.
 */
export const authApi = {
  /**
   * Authenticate with email and password credentials against the platform admin
   * sign-in endpoint. No tenant context is required or sent.
   * Returns the access token on success; throws on 401 (bad credentials) or
   * 403 (no PLATFORM_ADMIN role / account locked).
   */
  signIn: (body: SignInRequest): Promise<SignInResponse> =>
    httpClient.post<SignInResponse>("/v1/iam/auth/admin/signin", body).then((r) => r.data),

  /**
   * Revoke the server-side refresh token and terminate the session.
   * The Bearer token is attached automatically by the auth interceptor.
   */
  signOut: (): Promise<void> => httpClient.post("/v1/iam/auth/signout").then(() => undefined),
};
