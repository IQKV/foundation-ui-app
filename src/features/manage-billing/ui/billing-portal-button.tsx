import { Button, ButtonProps } from "@mantine/core";
import { IconExternalLink } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useBillingPortal } from "../model/use-billing-portal";

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
      {...props}
    >
      <Trans>Open Billing Portal</Trans>
    </Button>
  );
}
