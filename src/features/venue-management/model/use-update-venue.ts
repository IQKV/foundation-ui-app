import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";
import { toWriteRequest } from "./types";
import type { VenueFormValues } from "./types";

interface UseUpdateVenueOptions {
  venueId: string;
  onSuccess: () => void;
}

export function useUpdateVenue({ venueId, onSuccess }: UseUpdateVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: VenueFormValues) => catalogApi.replaceVenue(venueId, toWriteRequest(values)),
    onSuccess: () => {
      notifications.show({
        title: "Venue updated",
        message: "The venue has been updated successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not update the venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
