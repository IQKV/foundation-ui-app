import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { cmsApi } from "@/shared/api";
import type { PageFormValues } from "./types";

interface UseUpdatePageOptions {
  pageId: string;
  onSuccess: () => void;
}

export function useUpdatePage({ pageId, onSuccess }: UseUpdatePageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PageFormValues) =>
      cmsApi.updatePage(pageId, {
        slug: values.slug.trim(),
        parentId: values.parentId ?? null,
        template: values.template ?? null,
        status: values.status,
        translations: values.translations.map((tr) => ({
          locale: tr.locale,
          title: tr.title?.trim() ?? "",
          content: tr.content?.trim() ?? "",
          seoTitle: tr.seoTitle?.trim() || null,
          seoDescription: tr.seoDescription?.trim() || null,
          seoOpenGraphTitle: tr.seoOpenGraphTitle?.trim() || null,
          seoOpenGraphDescription: tr.seoOpenGraphDescription?.trim() || null,
          seoCanonicalUrl: tr.seoCanonicalUrl?.trim() || null,
        })),
      }),
    onSuccess: () => {
      notifications.show({
        title: "Page saved",
        message: "The CMS page has been updated successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "cms-pages"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "cms-page", pageId] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Save failed",
        message: "Could not save the page. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
