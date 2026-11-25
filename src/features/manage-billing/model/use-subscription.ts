import { useQuery, useMutation } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";
import type { CreateCheckoutSessionRequest } from "@/shared/api";

/**
 * `personal` selects the billing subject: true → the caller's user subject
 * (personal workspace), false → the active tenant. Mirrors the backend, which
 * resolves USER for the platform workspace and TENANT otherwise.
 */
export function useActiveSubscription(tenantKey: string | null, personal: boolean) {
  return useQuery({
    queryKey: ["billing", "subscription", "active", personal ? "me" : tenantKey],
    queryFn: () =>
      personal
        ? billingApi.getActiveSubscriptionForMe()
        : tenantKey
          ? billingApi.getActiveSubscription(tenantKey)
          : Promise.reject("No tenant key"),
    enabled: personal || !!tenantKey,
  });
}

export function useCreateCheckoutSession(tenantKey: string | null, personal: boolean) {
  return useMutation({
    mutationFn: (request: CreateCheckoutSessionRequest) => {
      if (personal) {
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
