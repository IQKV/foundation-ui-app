import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi, type UpdateMemberAuthoritiesRequest } from "@/shared/api";

interface UseUpdateMemberAuthoritiesOptions {
  userId: string;
  tenantKey: string;
  displayName: string;
  onSuccess: () => void;
}

export function useUpdateMemberAuthorities({
  userId,
  tenantKey,
  displayName,
  onSuccess,
}: UseUpdateMemberAuthoritiesOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateMemberAuthoritiesRequest) =>
      iamApi.updateMemberAuthorities(tenantKey, userId, data),
    onSuccess: () => {
      notifications.show({
        title: "Role updated",
        message: `${displayName}'s role has been updated successfully.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["members", tenantKey] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update the member's role. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
