import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";
import type { CreateCheckoutSessionRequest } from "@/shared/api";

export function useActiveSubscription(tenantKey: string | null) {
  return useQuery({
    queryKey: ["billing", "subscription", "active", tenantKey],
    queryFn: () =>
      tenantKey ? billingApi.getActiveSubscription(tenantKey) : Promise.reject("No tenant key"),
    enabled: !!tenantKey,
  });
}

export function useCreateCheckoutSession(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateCheckoutSessionRequest) => {
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
