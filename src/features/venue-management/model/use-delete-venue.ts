import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";

interface UseDeleteVenueOptions {
  onSuccess: () => void;
}

export function useDeleteVenue({ onSuccess }: UseDeleteVenueOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => catalogApi.deleteVenue(id),
    onSuccess: () => {
      notifications.show({
        title: "Venue deleted",
        message: "The venue has been deleted.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the venue. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
