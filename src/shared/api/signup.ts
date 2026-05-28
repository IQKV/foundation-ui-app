import { httpClient } from "./http-client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface RegisterUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SignupResponse {
  userId: string;
  email: string;
  tenantKey: string;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const signupApi = {
  /**
   * Register a new user and add them to the hidden platform tenant.
   * Returns 201 with platform tenantKey.
   */
  register: (body: RegisterUserRequest): Promise<SignupResponse> =>
    httpClient.post<SignupResponse>("/v1/iam/auth/signup", body).then((r) => r.data),
};
