import { httpClient } from "./http-client";

export interface PortalSessionResponse {
  url: string;
}

export interface Plan {
  id: string;
  planCode: string;
  displayName: string;
  billingPeriod: "MONTHLY" | "ANNUAL";
  priceMinor: number;
  currency: string;
  featureSet: string;
  scope: "TENANT" | "USER";
  active: boolean;
}

export interface SubscriptionResponse {
  id: string;
  tenantKey: string;
  externalSubscriptionId: string;
  status: string;
  planId: string;
  quantity: number;
  trialStart: string | null;
  trialEnd: string | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
}

export interface CreateCheckoutSessionRequest {
  priceId: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  quantity?: number;
  allowPromotionCodes?: boolean;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface BillingSettingsResponse {
  id: string;
  tenantKey: string;
  billingEmail: string;
  companyName: string;
  billingAddress: string;
  taxId: string;
  taxIdType: string;
  currency: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateBillingSettingsRequest {
  billingEmail?: string;
  companyName?: string;
  billingAddress?: string;
  taxId?: string;
  taxIdType?: string;
  currency?: string;
}

export interface RefundResponse {
  id: string;
  tenantKey: string;
  externalRefundId: string;
  externalPaymentId: string;
  amount: number;
  currency: string;
  status: string;
  occurredAt: string;
}

export const billingApi = {
  /**
   * List all active plans in the catalog.
   */
  listPlans: () => httpClient.get<Plan[]>("/v1/billing/plans").then((r) => r.data),

  /**
   * Get active subscription for a tenant.
   * Requires TENANT_OWNER or MEMBER authority.
   */
  getActiveSubscription: (tenantKey: string) =>
    httpClient
      .get<SubscriptionResponse>(
        `/v1/billing/subscriptions/${encodeURIComponent(tenantKey)}/active`,
      )
      .then((r) => r.data),

  /**
   * List refunds for a tenant.
   * Requires TENANT_OWNER authority.
   */
  listRefunds: (tenantKey: string) =>
    httpClient
      .get<RefundResponse[]>(`/v1/billing/payments/${encodeURIComponent(tenantKey)}/refunds`)
      .then((r) => r.data),

  /**
   * Get billing settings for a tenant.
   * Requires TENANT_OWNER authority.
   */
  getBillingSettings: (tenantKey: string) =>
    httpClient
      .get<BillingSettingsResponse>(`/v1/billing/settings/${encodeURIComponent(tenantKey)}`)
      .then((r) => r.data),

  /**
   * Update billing settings for a tenant.
   * Requires TENANT_OWNER authority.
   */
  updateBillingSettings: (tenantKey: string, request: UpdateBillingSettingsRequest) =>
    httpClient
      .patch<BillingSettingsResponse>(
        `/v1/billing/settings/${encodeURIComponent(tenantKey)}`,
        request,
      )
      .then((r) => r.data),

  /**
   * Create a Stripe Checkout Session for a tenant.
   * Requires TENANT_OWNER authority.
   */
  createCheckoutSession: (tenantKey: string, request: CreateCheckoutSessionRequest) =>
    httpClient
      .post<CheckoutSessionResponse>(
        `/v1/billing/subscriptions/${encodeURIComponent(tenantKey)}/checkout`,
        request,
      )
      .then((r) => r.data),

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
