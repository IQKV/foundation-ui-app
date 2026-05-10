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
 * The silent-refresh endpoint (`POST /v1/iam/auth/refresh`) is intentionally
 * excluded here — it is handled exclusively by `auth-interceptor.ts` to ensure
 * deduplication of concurrent refresh calls and correct retry behaviour.
 */
export const authApi = {
  /**
   * Authenticate with email and password credentials.
   * Returns the access token on success.
   */
  signIn: (body: SignInRequest): Promise<SignInResponse> =>
    httpClient.post<SignInResponse>("/v1/iam/auth/signin", body).then((r) => r.data),

  /**
   * Revoke the server-side refresh token and terminate the session.
   * The Bearer token is attached automatically by the auth interceptor.
   */
  signOut: (): Promise<void> =>
    httpClient.post("/v1/iam/auth/signout").then(() => undefined),
};
