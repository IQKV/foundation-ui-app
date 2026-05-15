import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { iamApi } from "@/shared/api";
import type { EditProfileFormValues } from "./types";

interface UseEditProfileOptions {
  onSuccess: () => void;
}

/**
 * Encapsulates the PATCH /v1/iam/users/me mutation.
 * X-Tenant-ID is injected automatically by the auth interceptor.
 * Invalidates the ["me"] query on success so the profile page re-fetches.
 */
export function useEditProfile({ onSuccess }: UseEditProfileOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: EditProfileFormValues) => iamApi.updateMe(values),
    onSuccess: () => {
      notifications.show({
        title: "Profile updated",
        message: "Your profile has been saved.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update your profile. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
