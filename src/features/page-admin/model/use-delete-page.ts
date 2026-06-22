import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { cmsApi } from "@/shared/api";

interface UseDeletePageOptions {
  onSuccess: () => void;
}

export function useDeletePage({ onSuccess }: UseDeletePageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pageId: string) => cmsApi.deletePage(pageId),
    onSuccess: () => {
      notifications.show({
        title: "Page deleted",
        message: "The CMS page has been deleted.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "cms-pages"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Delete failed",
        message: "Could not delete the page. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
