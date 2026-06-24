import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";
import type { CreateCheckoutSessionRequest } from "@/shared/api";
import { isSingleTenantMode } from "@/app/config";

export function useActiveSubscription(tenantKey: string | null) {
  return useQuery({
    queryKey: ["billing", "subscription", "active", isSingleTenantMode ? "me" : tenantKey],
    queryFn: () =>
      isSingleTenantMode
        ? billingApi.getActiveSubscriptionForMe()
        : tenantKey
          ? billingApi.getActiveSubscription(tenantKey)
          : Promise.reject("No tenant key"),
    enabled: isSingleTenantMode || !!tenantKey,
  });
}

export function useCreateCheckoutSession(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCheckoutSessionRequest) => {
      if (isSingleTenantMode) {
        return billingApi.createCheckoutSessionForMe(request);
      }
      if (!tenantKey) throw new Error("No tenant key");
      return billingApi.createCheckoutSession(tenantKey, request);
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      }
    },
  });
}
