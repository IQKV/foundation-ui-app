import { notifications } from "@mantine/notifications";
import { useMutation } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";

interface UseChangePasswordOptions {
  onSuccess: () => void;
}

/**
 * Encapsulates the POST /v1/iam/users/me/password mutation.
 * Requires the current password for re-authentication.
 * On success, all existing sessions are invalidated server-side.
 */
export function useChangePassword({ onSuccess }: UseChangePasswordOptions) {
  return useMutation({
    mutationFn: (data: { currentPassword: string; newPassword: string }) =>
      iamApi.changePassword(data),
    onSuccess: () => {
      notifications.show({
        title: "Password changed",
        message: "Your password has been updated. All other sessions have been invalidated.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      onSuccess();
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      notifications.show({
        title: "Password change failed",
        message:
          status === 401
            ? "Current password is incorrect. Please try again."
            : "Could not change your password. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
