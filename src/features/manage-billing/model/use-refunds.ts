import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";

/**
 * `personal` selects the billing subject: true → the caller's own refunds
 * (personal workspace), false → the active tenant's refunds.
 */
export function useRefunds(tenantKey: string | null, personal: boolean) {
  return useQuery({
    queryKey: ["billing", "refunds", personal ? "me" : tenantKey],
    queryFn: () =>
      personal
        ? billingApi.listRefundsForMe()
        : tenantKey
          ? billingApi.listRefunds(tenantKey)
          : Promise.reject("No tenant key"),
    enabled: personal || !!tenantKey,
  });
}
