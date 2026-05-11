import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";
import type { EditTenantFormValues } from "./types";

interface UseEditTenantOptions {
  tenantKey: string;
  displayName: string;
  onSuccess: () => void;
}

/**
 * Encapsulates the PATCH /v1/iam/admin/tenants/{tenantKey} mutation.
 * Handles success/error notifications and query invalidation.
 */
export function useEditTenant({ tenantKey, displayName, onSuccess }: UseEditTenantOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EditTenantFormValues) => iamApi.updateTenant(tenantKey, values),
    onSuccess: () => {
      notifications.show({
        title: "Organization updated",
        message: `${displayName} has been updated.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "tenants"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update the organization. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
