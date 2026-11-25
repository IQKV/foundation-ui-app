import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { billingApi } from "@/shared/api";
import type { CreateBillingSettingsRequest, UpdateBillingSettingsRequest } from "@/shared/api";

/**
 * `personal` selects the billing subject: true → the caller's user settings
 * (personal workspace), false → the active tenant. Mirrors the backend, which
 * resolves USER for the platform workspace and TENANT otherwise.
 */
export function useBillingSettings(tenantKey: string | null, personal: boolean) {
  return useQuery({
    queryKey: ["billing", "settings", personal ? "user-settings" : tenantKey],
    queryFn: () =>
      personal
        ? billingApi.getUserBillingSettings()
        : tenantKey
          ? billingApi.getBillingSettings(tenantKey)
          : Promise.reject("No tenant key"),
    enabled: personal || !!tenantKey,
    // Do not retry on 404 — "not found" is an expected state (settings not yet created).
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 404) return false;
      return failureCount < 3;
    },
  });
}

/**
 * Returns true when the query error is a 404 (billing settings not yet created).
 */
export function isBillingSettingsNotFound(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

export function useCreateBillingSettings(tenantKey: string | null, personal: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBillingSettingsRequest) => {
      if (personal) {
        return billingApi.createUserBillingSettings(request);
      }
      if (!tenantKey) throw new Error("No tenant key");
      return billingApi.createBillingSettings(tenantKey, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing", "settings", personal ? "user-settings" : tenantKey],
      });
    },
  });
}

export function useUpdateBillingSettings(tenantKey: string | null, personal: boolean) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateBillingSettingsRequest) => {
      if (personal) {
        return billingApi.updateUserBillingSettings(request);
      }
      if (!tenantKey) throw new Error("No tenant key");
      return billingApi.updateBillingSettings(tenantKey, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing", "settings", personal ? "user-settings" : tenantKey],
      });
    },
  });
}
