import { httpClient } from "./http-client";
import type { PagedResponse, SortDirection } from "./iam";

// ─── Types ────────────────────────────────────────────────────────────────────

export type SubscriptionStatus = "active" | "canceled" | "past_due" | "trialing" | "unpaid";

export type SubscriptionSortField = "tenantKey" | "planId" | "status" | "updatedAt" | "createdAt";

export interface Subscription {
  id: string;
  tenantKey: string;
  externalSubscriptionId: string;
  status: string;
  planId: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  subjectType: string | null;
  subjectKey: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListSubscriptionsParams {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  tenantKey?: string;
  sortBy?: SubscriptionSortField;
  sortDir?: SortDirection;
}

export interface UpdateSubscriptionRequest {
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

// ─── API ──────────────────────────────────────────────────────────────────────

export const billingApi = {
  listSubscriptions: (params: ListSubscriptionsParams = {}) =>
    httpClient
      .get<PagedResponse<Subscription>>("/v1/billing/admin/subscriptions", { params })
      .then((r) => r.data),

  getSubscription: (id: string) =>
    httpClient.get<Subscription>(`/v1/billing/admin/subscriptions/${id}`).then((r) => r.data),

  updateSubscription: (id: string, data: UpdateSubscriptionRequest) =>
    httpClient
      .patch<Subscription>(`/v1/billing/admin/subscriptions/${id}`, data)
      .then((r) => r.data),

  deleteSubscription: (id: string) => httpClient.delete(`/v1/billing/admin/subscriptions/${id}`),
};
