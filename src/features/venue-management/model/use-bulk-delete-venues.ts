import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { catalogApi } from "@/shared/api";

interface UseBulkDeleteVenuesOptions {
  onSuccess: () => void;
}

export function useBulkDeleteVenues({ onSuccess }: UseBulkDeleteVenuesOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => catalogApi.bulkDeleteVenues(ids),
    onSuccess: (_data, ids) => {
      notifications.show({
        title: "Venues deleted",
        message:
          ids.length === 1 ? "The venue has been deleted." : `${ids.length} venues have been deleted.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the selected venues. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
