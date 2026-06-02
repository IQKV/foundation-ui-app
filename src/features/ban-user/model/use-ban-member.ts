import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseBanMemberOptions {
  userId: string;
  tenantKey: string;
  displayName: string;
  onSuccess: () => void;
}

export function useBanMember({ userId, tenantKey, displayName, onSuccess }: UseBanMemberOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { reason?: string; expiresAt?: Date | null }) =>
      iamApi.banMember(tenantKey, userId, {
        reason: data.reason,
        expiresAt: data.expiresAt ? data.expiresAt.toISOString() : undefined,
      }),
    onSuccess: () => {
      notifications.show({
        title: "Member banned",
        message: `${displayName} has been banned from this tenant. All their sessions have been invalidated.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["members", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Ban failed",
        message: "Could not ban the member. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
