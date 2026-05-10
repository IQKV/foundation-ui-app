import { Button } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useSignOut } from "../model/use-sign-out";

/**
 * A sign-out button that triggers the explicit sign-out action.
 *
 * Disabled while the sign-out request is in flight to prevent duplicate
 * requests (Requirement 6.4).
 */
export function SignOutButton() {
  const { isLoading, signOut } = useSignOut();

  return (
    <Button
      variant="subtle"
      color="gray"
      size="sm"
      leftSection={<IconLogout size={16} />}
      loading={isLoading}
      disabled={isLoading}
      onClick={() => void signOut()}
    >
      <Trans>Sign out</Trans>
    </Button>
  );
}
