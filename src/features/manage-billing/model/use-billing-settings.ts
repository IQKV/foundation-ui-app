import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";
import type { UpdateBillingSettingsRequest } from "@/shared/api";

export function useBillingSettings(tenantKey: string | null) {
  return useQuery({
    queryKey: ["billing", "settings", tenantKey],
    queryFn: () =>
      tenantKey ? billingApi.getBillingSettings(tenantKey) : Promise.reject("No tenant key"),
    enabled: !!tenantKey,
  });
}

export function useUpdateBillingSettings(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateBillingSettingsRequest) => {
      if (!tenantKey) throw new Error("No tenant key");
      return billingApi.updateBillingSettings(tenantKey, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["billing", "settings", tenantKey] });
    },
  });
}
