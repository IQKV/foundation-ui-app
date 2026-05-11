// Side-effect import: registers request/response interceptors on httpClient.
// Must be imported once at app bootstrap (see src/main.tsx).
import "./auth-interceptor";

export { httpClient } from "./http-client";
export { iamApi } from "./iam";
export type {
  IamUser,
  IamUserStatus,
  IamUserSortField,
  IamTenant,
  IamTenantStatus,
  IamTenantSortField,
  SortDirection,
  PagedResponse,
  CountResponse,
  ListIamUsersParams,
  ListIamTenantsParams,
} from "./iam";
export { authApi } from "./auth";
export type { SignInRequest, SignInResponse } from "./auth";
export { billingApi } from "./billing";
export type {
  Subscription,
  SubscriptionStatus,
  SubscriptionSortField,
  ListSubscriptionsParams,
  UpdateSubscriptionRequest,
} from "./billing";
export { useDashboardCounts } from "./use-dashboard-counts";
export type { UseDashboardCountsResult, DashboardCountResult } from "./use-dashboard-counts";
