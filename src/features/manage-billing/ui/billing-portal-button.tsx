import { Button, ButtonProps } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useBillingPortal } from "../model/use-billing-portal";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface BillingPortalButtonProps extends ButtonProps {
  tenantKey?: string;
}

export function BillingPortalButton({ tenantKey, ...props }: BillingPortalButtonProps) {
  const { mutate, isPending } = useBillingPortal(tenantKey);

  return (
    <Button
      variant="outline"
      leftSection={<IconExternalLink size={16} />}
      onClick={() => mutate()}
      loading={isPending}
      data-testid={TestSelectors.BILLING_PORTAL_BUTTON}
      {...props}
    >
      <Trans>Open Billing Portal</Trans>
    </Button>
  );
}
