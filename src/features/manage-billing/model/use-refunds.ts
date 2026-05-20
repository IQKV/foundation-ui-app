import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";

export function useRefunds(tenantKey: string | null) {
  return useQuery({
    queryKey: ["billing", "refunds", tenantKey],
    queryFn: () =>
      tenantKey ? billingApi.listRefunds(tenantKey) : Promise.reject("No tenant key"),
    enabled: !!tenantKey,
  });
}
