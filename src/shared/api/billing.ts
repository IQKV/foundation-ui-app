import { httpClient } from "./http-client";

export interface PortalSessionResponse {
  url: string;
}

export const billingApi = {
  /**
   * Create a Stripe Customer Portal session for a tenant.
   * Requires TENANT_OWNER authority.
   */
  createTenantPortalSession: (tenantKey: string) =>
    httpClient
      .post<PortalSessionResponse>(`/v1/billing/settings/${encodeURIComponent(tenantKey)}/portal`)
      .then((r) => r.data),

  /**
   * Create a Stripe Customer Portal session for the current user.
   * Only active in SINGLE_TENANT mode.
   */
  createUserPortalSession: () =>
    httpClient.post<PortalSessionResponse>("/v1/billing/user-settings/portal").then((r) => r.data),
};
