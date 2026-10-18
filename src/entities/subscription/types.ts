export type SubscriptionStatus =
  | "active"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "past_due"
  | "trialing"
  | "unpaid"
  | "paused";

export type GatewayType = "STRIPE" | "LEMON_SQUEEZY";

export interface Subscription {
  id: string;
  tenantKey: string;
  externalSubscriptionId: string;
  externalCustomerId?: string | null;
  status: SubscriptionStatus;
  planId: string;
  quantity: number;
  trialStart: string | null;
  trialEnd: string | null;
  isInTrial: boolean;
  trialDaysLeft: number | null;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  gatewayType?: GatewayType;
  externalOrderId?: string | null;
  /** Deadline of the failed-renewal grace window; null when not in grace. */
  gracePeriodEnd: string | null;
  /** True when the subscription is past_due inside its grace window — access still granted. */
  inGracePeriod: boolean;
  /** Failed payment attempts recorded by the gateway; null when never retried. */
  paymentRetryCount: number | null;
}

// ─── Plan ─────────────────────────────────────────────────────────────────────

export type PricingModel = "FLAT" | "PER_SEAT" | "METERED";

export interface Plan {
  id: string;
  planCode: string;
  displayName: string;
  description?: string;
  billingPeriod: "MONTHLY" | "ANNUAL";
  priceMinor: number;
  currency: string;
  entitlement: string;
  scope: "TENANT" | "USER";
  externalProductId?: string | null;
  externalPriceId?: string | null;
  active: boolean;
  trialPeriodDays?: number;
  /** Pricing mode: FLAT (fixed price per period), PER_SEAT (price × quantity), or METERED
   *  (usage-based). Null for plans predating the per-seat feature — treat as FLAT. */
  pricingModel?: PricingModel | null;
  gatewayType?: GatewayType;
}

// ─── Entitlements ─────────────────────────────────────────────────────────────

export interface PlanFeature {
  code: string;
  title: string;
  value: string;
  description?: string;
}

export interface PlanEntitlement {
  maxUsers: number;
  maxProjects: number;
  features: Record<string, PlanFeature>;
  /** Pricing mode carried from the billing catalog. Null for plans predating per-seat support —
   *  treat as FLAT. */
  pricingModel?: PricingModel | null;
}

export interface Entitlements {
  planCode: string;
  status: "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "unpaid";
  currentPeriodEnd: string;
  features: PlanEntitlement;
}

// ─── Checkout ─────────────────────────────────────────────────────────────────

export interface CreateCheckoutSessionRequest {
  planCode: string;
  successUrl: string;
  cancelUrl: string;
  trialPeriodDays?: number;
  quantity?: number;
  allowPromotionCodes?: boolean;
}

export interface CheckoutSessionResponse {
  checkoutUrl: string;
}

export interface PortalSessionResponse {
  url: string;
}

// ─── Billing settings ─────────────────────────────────────────────────────────

export interface BillingSettings {
  id: string;
  tenantKey: string;
  externalCustomerId?: string | null;
  billingEmail: string;
  companyName: string;
  billingAddress: string;
  taxId: string;
  taxIdType: string;
  currency: string;
  gatewayType?: GatewayType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBillingSettingsRequest {
  billingEmail: string;
  companyName?: string;
  billingAddress?: string;
  taxId?: string;
  taxIdType?: string;
  currency: string;
}

export interface UpdateBillingSettingsRequest {
  billingEmail?: string;
  companyName?: string;
  billingAddress?: string;
  taxId?: string;
  taxIdType?: string;
  currency?: string;
}
