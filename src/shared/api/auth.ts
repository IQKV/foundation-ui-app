import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface SignInRequest {
  email: string;
  password: string;
}

export interface SignInResponse {
  accessToken: string;
  refreshToken: string;
  tenantKey: string;
}

export interface TenantExchangeRequest {
  tenantKey: string;
}

export interface TenantMembershipSummary {
  tenantKey: string;
  tenantName: string;
  membershipStatus: string;
  authorities: string[];
  isPersonal: boolean;
}

export interface SignupStatusResponse {
  tenantKey: string;
  tenantStatus: string;
}

export type ProvisioningStatus = "PROVISIONING" | "ACTIVE" | "PROVISIONING_FAILED";

// ─── API ──────────────────────────────────────────────────────────────────────

/**
 * Auth API wrappers for tenant sign-in and sign-out.
 *
 * Uses the tenant sign-in endpoint (`POST /v1/iam/auth/signin`) which requires
 * an `X-Tenant-ID` header (injected by the auth interceptor from the selected
 * tenant context). Returns 403 if the user has no active membership in the
 * requested tenant.
 *
 * The silent-refresh endpoint (`POST /v1/iam/auth/refresh`) is handled
 * exclusively by `auth-interceptor.ts` to ensure deduplication of concurrent
 * refresh calls and correct retry behaviour.
 */
export const authApi = {
  /**
   * Discover which tenants the user belongs to before sign-in.
   * Used in the tenant-selection step of the sign-in flow.
   * No JWT required — credentials are validated server-side.
   */
  listUserTenants: (email: string, password: string): Promise<TenantMembershipSummary[]> =>
    httpClient
      .post<TenantMembershipSummary[]>("/v1/iam/users/tenants", { email, password })
      .then((r) => r.data),

  /**
   * Poll tenant provisioning status after signup.
   */
  signupStatus: (tenantKey: string): Promise<SignupStatusResponse> =>
    httpClient
      .get<SignupStatusResponse>(`/v1/iam/auth/signup/status/${tenantKey}`)
      .then((r) => r.data),

  /**
   * Authenticate with email and password within a specific tenant context.
   * The `X-Tenant-ID` header must be set on the httpClient before calling this
   * (handled by the sign-in flow after tenant selection).
   */
  signIn: (body: SignInRequest, tenantKey: string): Promise<SignInResponse> =>
    httpClient
      .post<SignInResponse>("/v1/iam/auth/signin", body, {
        headers: { "X-Tenant-ID": tenantKey },
      })
      .then((r) => r.data),

  /**
   * Exchange the current access token for a new tenant-scoped token pair.
   * Requires a valid Bearer access token.
   */
  exchangeTenant: (tenantKey: string): Promise<SignInResponse> =>
    httpClient
      .post<SignInResponse>("/v1/iam/auth/exchange", { tenantKey } satisfies TenantExchangeRequest)
      .then((r) => r.data),

  /**
   * Revoke the server-side refresh token and terminate the session.
   * The Bearer token is attached automatically by the auth interceptor.
   */
  signOut: (): Promise<void> => httpClient.post("/v1/iam/auth/signout").then(() => undefined),
};
