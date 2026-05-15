import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseRevokeInvitationOptions {
  tenantKey: string;
  invitationId: string;
  email: string;
  onSuccess: () => void;
}

/**
 * Encapsulates DELETE /v1/iam/tenants/{tenantKey}/invitations/{invitationId}.
 * X-Tenant-ID is injected automatically by the auth interceptor.
 * Invalidates ["invitations", tenantKey] on success.
 */
export function useRevokeInvitation({
  tenantKey,
  invitationId,
  email,
  onSuccess,
}: UseRevokeInvitationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.revokeInvitation(tenantKey, invitationId),
    onSuccess: () => {
      notifications.show({
        title: "Invitation revoked",
        message: `Invitation for ${email} has been revoked.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["invitations", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Revoke failed",
        message: "Could not revoke the invitation. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
