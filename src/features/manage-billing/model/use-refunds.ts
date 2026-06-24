import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";
import { isSingleTenantMode } from "@/app/config";

export function useRefunds(tenantKey: string | null) {
  return useQuery({
    queryKey: ["billing", "refunds", isSingleTenantMode ? "me" : tenantKey],
    queryFn: () =>
      isSingleTenantMode
        ? billingApi.listRefundsForMe()
        : tenantKey
          ? billingApi.listRefunds(tenantKey)
          : Promise.reject("No tenant key"),
    enabled: isSingleTenantMode || !!tenantKey,
  });
}
