import { useMutation, useQueryClient } from "@tanstack/react-query";
import { iamApi } from "@/shared/api";
import type { UpdateMemberAuthoritiesRequest } from "@/shared/api";

export function useUpdateMemberAuthorities(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateMemberAuthoritiesRequest }) => {
      if (!tenantKey) throw new Error("No tenant key");
      return iamApi.updateMemberAuthorities(tenantKey, userId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", tenantKey] });
    },
  });
}

export function useRemoveMember(tenantKey: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => {
      if (!tenantKey) throw new Error("No tenant key");
      return iamApi.removeMember(tenantKey, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members", tenantKey] });
    },
  });
}
