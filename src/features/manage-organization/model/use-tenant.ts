import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { iamApi } from "@/shared/api";
import type { UpdateTenantRequest, UpdateTenantStatusRequest } from "@/shared/api";

export function useTenant(tenantKey: string | null) {
  return useQuery({
    queryKey: ["tenant", tenantKey],
    queryFn: () => (tenantKey ? iamApi.getTenant(tenantKey) : Promise.reject("No tenant key")),
    enabled: !!tenantKey,
  });
}

export function useUpdateTenant(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantRequest) => {
      if (!tenantKey) throw new Error("No tenant key");
      return iamApi.updateTenant(tenantKey, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantKey] });
      queryClient.invalidateQueries({ queryKey: ["my-memberships"] });
    },
  });
}

export function useUpdateTenantStatus(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateTenantStatusRequest) => {
      if (!tenantKey) throw new Error("No tenant key");
      return iamApi.updateTenantStatus(tenantKey, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantKey] });
    },
  });
}

export function useRetryProvisioning(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => {
      if (!tenantKey) throw new Error("No tenant key");
      return iamApi.retryProvisioning(tenantKey);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant", tenantKey] });
    },
  });
}
