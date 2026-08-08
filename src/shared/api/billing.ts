import { httpClient } from "./http-client";
import type {
  Plan,
  PricingModel,
  PlanFeature,
  PlanEntitlement,
  Entitlements,
  Subscription,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  PortalSessionResponse,
  BillingSettings,
  CreateBillingSettingsRequest,
  UpdateBillingSettingsRequest,
} from "@/entities/subscription";
import type { Refund } from "@/entities/refund";
import type { WebhookLog, PagedWebhookLogResponse } from "@/entities/webhook-log";

// Re-export entity types so existing imports from "@/shared/api" keep working.
export type {
  Plan,
  PricingModel,
  PlanFeature,
  PlanEntitlement,
  CreateCheckoutSessionRequest,
  CheckoutSessionResponse,
  PortalSessionResponse,
  Refund,
  WebhookLog,
  PagedWebhookLogResponse,
};

// API response aliases — keep the *Response suffix that consumers already use.
export type SubscriptionResponse = Subscription;
export type EntitlementsResponse = Entitlements;
export type BillingSettingsResponse = BillingSettings;
export type RefundResponse = Refund;
export type { CreateBillingSettingsRequest, UpdateBillingSettingsRequest };

// ─── Billing API ──────────────────────────────────────────────────────────────

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
      .get<Subscription>(`/v1/billing/subscriptions/${encodeURIComponent(tenantKey)}/active`)
      .then((r) => r.data),

  /**
   * Get active subscription for current subject (tenant or user depending on mode).
   * Requires TENANT_OWNER or MEMBER authority.
   */
  getActiveSubscriptionForMe: () =>
    httpClient.get<Subscription>(`/v1/billing/subscriptions/me/active`).then((r) => r.data),

  /**
   * Create a Stripe Checkout Session for current subject (single tenant mode).
   * Requires TENANT_OWNER authority.
   * Backend: POST /api/v1/billing/subscriptions/me/checkout
   */
  createCheckoutSessionForMe: (request: CreateCheckoutSessionRequest) =>
    httpClient
      .post<CheckoutSessionResponse>("/v1/billing/subscriptions/me/checkout", request)
      .then((r) => r.data),

  /**
   * Create a Stripe Checkout Session for a specific tenant.
   * Requires TENANT_OWNER authority.
   * Backend: POST /api/v1/billing/subscriptions/{tenantKey}/checkout
   */
  createCheckoutSession: (tenantKey: string, request: CreateCheckoutSessionRequest) =>
    httpClient
      .post<CheckoutSessionResponse>(
        `/v1/billing/subscriptions/${encodeURIComponent(tenantKey)}/checkout`,
        request,
      )
      .then((r) => r.data),

  /**
   * Create a Stripe Customer Portal session for current user (single-tenant mode).
   * Backend: POST /api/v1/billing/user-settings/portal
   */
  createUserPortalSession: () =>
    httpClient.post<PortalSessionResponse>("/v1/billing/user-settings/portal").then((r) => r.data),

  /**
   * Create a Stripe Customer Portal session for a specific tenant.
   * Backend: POST /api/v1/billing/settings/{tenantKey}/portal
   */
  createTenantPortalSession: (tenantKey: string) =>
    httpClient
      .post<PortalSessionResponse>(`/v1/billing/settings/${encodeURIComponent(tenantKey)}/portal`)
      .then((r) => r.data),

  /**
   * Get entitlements for current subject (resolves to user or tenant based on mode).
   * Backend: GET /api/v1/billing/entitlements/me
   * This is the only entitlements endpoint — subject is resolved server-side from the JWT.
   */
  getEntitlements: () =>
    httpClient.get<Entitlements>("/v1/billing/entitlements/me").then((r) => r.data),

  /**
   * List refunds for current user (single-tenant mode).
   */
  listRefundsForMe: () =>
    httpClient.get<Refund[]>("/v1/billing/payments/me/refunds").then((r) => r.data),

  /**
   * List refunds for a specific tenant.
   */
  listRefunds: (tenantKey: string) =>
    httpClient
      .get<Refund[]>(`/v1/billing/payments/${encodeURIComponent(tenantKey)}/refunds`)
      .then((r) => r.data),

  /**
   * Get billing settings for a specific tenant.
   */
  getBillingSettings: (tenantKey: string) =>
    httpClient
      .get<BillingSettings>(`/v1/billing/settings/${encodeURIComponent(tenantKey)}`)
      .then((r) => r.data),

  /**
   * Get billing settings for current user (single-tenant mode).
   * Backend: GET /api/v1/billing/user-settings
   */
  getUserBillingSettings: () =>
    httpClient.get<BillingSettings>("/v1/billing/user-settings").then((r) => r.data),

  /**
   * Create billing settings for a specific tenant.
   */
  createBillingSettings: (tenantKey: string, data: CreateBillingSettingsRequest) =>
    httpClient
      .post<BillingSettings>(`/v1/billing/settings/${encodeURIComponent(tenantKey)}`, data)
      .then((r) => r.data),

  /**
   * Update billing settings for a specific tenant.
   */
  updateBillingSettings: (tenantKey: string, data: UpdateBillingSettingsRequest) =>
    httpClient
      .patch<BillingSettings>(`/v1/billing/settings/${encodeURIComponent(tenantKey)}`, data)
      .then((r) => r.data),

  /**
   * Create billing settings for current user (single-tenant mode).
   * Backend: POST /api/v1/billing/user-settings
   */
  createUserBillingSettings: (data: CreateBillingSettingsRequest) =>
    httpClient.post<BillingSettings>("/v1/billing/user-settings", data).then((r) => r.data),

  /**
   * Update billing settings for current user (single-tenant mode).
   * Backend: PATCH /api/v1/billing/user-settings
   */
  updateUserBillingSettings: (data: UpdateBillingSettingsRequest) =>
    httpClient.patch<BillingSettings>("/v1/billing/user-settings", data).then((r) => r.data),

  /**
   * List webhook logs for the current subject (tenant in multi-tenant, user in single-tenant).
   * Requires TENANT_OWNER, ADMIN, or MEMBER authority.
   */
  listWebhookLogsForMe: (
    params: {
      page?: number;
      size?: number;
      sortBy?: string;
      sortDir?: string;
      search?: string;
      status?: string;
    } = {},
  ) =>
    httpClient
      .get<PagedWebhookLogResponse>("/v1/billing/webhook-logs/me", { params })
      .then((r) => r.data),

  /**
   * Get a single webhook log by ID for the current subject.
   * Requires TENANT_OWNER, ADMIN, or MEMBER authority.
   */
  getWebhookLogForMe: (id: string) =>
    httpClient.get<WebhookLog>(`/v1/billing/webhook-logs/me/${id}`).then((r) => r.data),
};
