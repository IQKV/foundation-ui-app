import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";

/**
 * Hook to fetch current user/tenant entitlements.
 *
 * Returns active plan, subscription status, and typed features for the current subject.
 * Subject resolves to tenant (multi-tenant) or user (single-tenant) based on rollout mode.
 *
 * @returns React Query result with entitlements data or 404 if no active subscription
 */
export function useEntitlements() {
  return useQuery({
    queryKey: ["billing", "entitlements", "me"],
    queryFn: () => billingApi.getEntitlements(),
    staleTime: 1000 * 60 * 5, // 5 minutes - entitlements change rarely
    retry: (failureCount, error: any) => {
      // Don't retry on 404 - no active subscription is a valid state
      if (error?.response?.status === 404) {
        return false;
      }
      // Standard retry for other errors
      return failureCount < 3;
    },
  });
}
