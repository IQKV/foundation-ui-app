import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";
import type { EditUserFormValues } from "./types";

interface UseEditUserOptions {
  userId: string;
  displayName: string;
  onSuccess: () => void;
}

/**
 * Encapsulates the PATCH /v1/iam/admin/users/{id} mutation.
 * Handles success/error notifications and query invalidation.
 */
export function useEditUser({ userId, displayName, onSuccess }: UseEditUserOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EditUserFormValues) => iamApi.updateUser(userId, values),
    onSuccess: () => {
      notifications.show({
        title: "User updated",
        message: `${displayName} has been updated.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update the user. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
