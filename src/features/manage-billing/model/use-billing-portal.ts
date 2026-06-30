import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createElement } from "react";
import { IconX } from "@tabler/icons-react";
import { useLingui } from "@lingui/react/macro";
import { billingApi } from "@/shared/api";

export function useBillingPortal(tenantKey?: string) {
  const { t } = useLingui();

  return useMutation({
    mutationFn: () => {
      if (tenantKey) {
        return billingApi.createTenantPortalSession(tenantKey);
      }
      return billingApi.createUserPortalSession();
    },
    onSuccess: (res) => {
      window.location.href = res.url;
    },
    onError: () => {
      notifications.show({
        title: t`Portal error`,
        message: t`Could not open the billing portal. Please try again.`,
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
