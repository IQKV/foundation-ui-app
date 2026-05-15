import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";
import type { SendInvitationFormValues } from "./types";

interface UseSendInvitationOptions {
  tenantKey: string;
  onSuccess: () => void;
}

/**
 * Encapsulates POST /v1/iam/tenants/{tenantKey}/invitations.
 * X-Tenant-ID is injected automatically by the auth interceptor.
 * Invalidates ["invitations", tenantKey] on success.
 */
export function useSendInvitation({ tenantKey, onSuccess }: UseSendInvitationOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: SendInvitationFormValues) =>
      iamApi.sendInvitation(tenantKey, {
        email: values.email.trim(),
        authority: values.authority,
      }),
    onSuccess: (invitation) => {
      notifications.show({
        title: "Invitation sent",
        message: `Invitation sent to ${invitation.email}.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["invitations", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Failed to send invitation",
        message: "Could not send the invitation. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
