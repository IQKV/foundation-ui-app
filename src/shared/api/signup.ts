import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  tenantName?: string;
}

export interface SignupResponse {
  userId: string;
  email: string;
  tenantKey: string;
  tenantStatus: string;
}

export type ProvisioningStatus = "PROVISIONING" | "ACTIVE" | "PROVISIONING_FAILED";

export interface SignupStatusResponse {
  tenantKey: string;
  tenantStatus: ProvisioningStatus;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const signupApi = {
  /**
   * Register a new user and create a tenant in one atomic step.
   * Returns 201 with tenantStatus=PROVISIONING.
   * Poll `getProvisioningStatus` until ACTIVE before signing in.
   */
  register: (body: RegisterUserRequest): Promise<SignupResponse> =>
    httpClient.post<SignupResponse>("/v1/iam/auth/signup", body).then((r) => r.data),

  /**
   * Poll the provisioning status of a newly created tenant.
   * Public endpoint — no JWT required.
   * Returns PROVISIONING, ACTIVE, or PROVISIONING_FAILED.
   */
  getProvisioningStatus: (tenantKey: string): Promise<SignupStatusResponse> =>
    httpClient
      .get<SignupStatusResponse>(`/v1/iam/auth/signup/status/${tenantKey}`)
      .then((r) => r.data),
};
