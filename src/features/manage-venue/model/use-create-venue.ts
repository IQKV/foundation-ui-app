import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";
import { toWriteRequest } from "./types";
import type { VenueFormValues } from "./types";

interface UseCreateVenueOptions {
  onSuccess: () => void;
}

export function useCreateVenue({ onSuccess }: UseCreateVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VenueFormValues) => catalogApi.createVenue(toWriteRequest(values)),
    onSuccess: () => {
      notifications.show({
        title: "Venue created",
        message: "The venue has been created successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Creation failed",
        message: "Could not create the venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
