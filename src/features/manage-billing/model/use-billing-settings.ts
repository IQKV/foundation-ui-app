import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { billingApi } from "@/shared/api";
import type { CreateBillingSettingsRequest, UpdateBillingSettingsRequest } from "@/shared/api";
import { isSingleTenantMode } from "@/app/config";

export function useBillingSettings(tenantKey: string | null) {
  return useQuery({
    queryKey: ["billing", "settings", isSingleTenantMode ? "user-settings" : tenantKey],
    queryFn: () =>
      isSingleTenantMode
        ? billingApi.getUserBillingSettings()
        : tenantKey
          ? billingApi.getBillingSettings(tenantKey)
          : Promise.reject("No tenant key"),
    enabled: isSingleTenantMode || !!tenantKey,
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

export function useCreateBillingSettings(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateBillingSettingsRequest) => {
      if (isSingleTenantMode) {
        return billingApi.createUserBillingSettings(request);
      }
      if (!tenantKey) throw new Error("No tenant key");
      return billingApi.createBillingSettings(tenantKey, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing", "settings", isSingleTenantMode ? "user-settings" : tenantKey],
      });
    },
  });
}

export function useUpdateBillingSettings(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateBillingSettingsRequest) => {
      if (isSingleTenantMode) {
        return billingApi.updateUserBillingSettings(request);
      }
      if (!tenantKey) throw new Error("No tenant key");
      return billingApi.updateBillingSettings(tenantKey, request);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["billing", "settings", isSingleTenantMode ? "user-settings" : tenantKey],
      });
    },
  });
}
