import { useQueries } from "@tanstack/react-query";
import { iamApi } from "./iam";
import { billingApi } from "./billing";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const dashboardCountKeys = {
  users: ["admin", "count", "users"] as const,
  tenants: ["admin", "count", "tenants"] as const,
  subscriptions: ["admin", "count", "subscriptions"] as const,
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export interface DashboardCountResult {
  value: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

export interface UseDashboardCountsResult {
  users: DashboardCountResult;
  tenants: DashboardCountResult;
  subscriptions: DashboardCountResult;
}

/**
 * Fires all three /count requests in parallel via useQueries.
 *
 * Each card gets its own independent loading/error state so a failure in one
 * does not block the others. Results are cached by TanStack Query and reused
 * on subsequent renders without re-fetching (staleTime inherited from the
 * global QueryClient default of 60 s).
 */
export function useDashboardCounts(): UseDashboardCountsResult {
  const [usersQuery, tenantsQuery, subscriptionsQuery] = useQueries({
    queries: [
      {
        queryKey: dashboardCountKeys.users,
        queryFn: iamApi.countUsers,
      },
      {
        queryKey: dashboardCountKeys.tenants,
        queryFn: iamApi.countTenants,
      },
      {
        queryKey: dashboardCountKeys.subscriptions,
        queryFn: billingApi.countSubscriptions,
      },
    ],
  });

  return {
    users: {
      value: usersQuery.data?.total,
      isLoading: usersQuery.isLoading,
      isError: usersQuery.isError,
    },
    tenants: {
      value: tenantsQuery.data?.total,
      isLoading: tenantsQuery.isLoading,
      isError: tenantsQuery.isError,
    },
    subscriptions: {
      value: subscriptionsQuery.data?.total,
      isLoading: subscriptionsQuery.isLoading,
      isError: subscriptionsQuery.isError,
    },
  };
}
