import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseTransferOwnershipOptions {
  userId: string;
  tenantKey: string;
  displayName: string;
  onSuccess: () => void;
}

export function useTransferOwnership({
  userId,
  tenantKey,
  displayName,
  onSuccess,
}: UseTransferOwnershipOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.transferOwnership(tenantKey, userId),
    onSuccess: () => {
      notifications.show({
        title: "Ownership transferred",
        message: `Ownership has been transferred to ${displayName}. You are now a member.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["members", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Transfer failed",
        message: "Could not transfer ownership. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
