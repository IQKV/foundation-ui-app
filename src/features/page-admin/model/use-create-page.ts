import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { createElement } from "react";
import { cmsApi } from "@/shared/api";
import type { PageFormValues } from "./types";

interface UseCreatePageOptions {
  onSuccess: () => void;
}

export function useCreatePage({ onSuccess }: UseCreatePageOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PageFormValues) =>
      cmsApi.createPage({
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
        title: "Page created",
        message: "The CMS page has been created successfully.",
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "cms-pages"] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Creation failed",
        message: "Could not create the page. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
