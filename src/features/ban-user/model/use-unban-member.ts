import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseUnbanMemberOptions {
  userId: string;
  tenantKey: string;
  displayName: string;
  onSuccess: () => void;
}

export function useUnbanMember({
  userId,
  tenantKey,
  displayName,
  onSuccess,
}: UseUnbanMemberOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => iamApi.unbanMember(tenantKey, userId),
    onSuccess: () => {
      notifications.show({
        title: "Member unbanned",
        message: `${displayName} has been unbanned and can now access this tenant again.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["members", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Unban failed",
        message: "Could not unban the member. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
