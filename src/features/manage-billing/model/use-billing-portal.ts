import { useMutation } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createElement } from "react";
import { IconX } from "@tabler/icons-react";
import { useLingui } from "@lingui/react/macro";
import { billingApi } from "@/shared/api";

/**
 * `personal` selects the billing subject: true → the caller's user portal
 * (personal workspace), false → the active tenant's portal.
 */
export function useBillingPortal(tenantKey: string | null, personal: boolean) {
  const { t } = useLingui();

  return useMutation({
    mutationFn: () => {
      if (personal) {
        return billingApi.createUserPortalSession();
      }
      if (!tenantKey) throw new Error("No tenant key");
      return billingApi.createTenantPortalSession(tenantKey);
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
