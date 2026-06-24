import { Alert, Button, Group, Stack, Text } from "@mantine/core";
import { IconAlertCircle, IconCheck, IconLoader2 } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useMagicLinkExchange } from "../model";

interface MagicLinkExchangeFormProps {
  token: string;
  redirectTo?: string;
}

export function MagicLinkExchangeForm({ token, redirectTo }: MagicLinkExchangeFormProps) {
  const { isLoading, errorMessage, isSuccess, exchangeToken } = useMagicLinkExchange();

  useEffect(() => {
    if (token) {
      void exchangeToken(token, redirectTo);
    }
  }, [token, redirectTo, exchangeToken]);

  if (isSuccess) {
    return (
      <Stack gap="md" align="center">
        <IconCheck size={48} color="var(--mantine-color-green-6)" />
        <Text ta="center" fw={500}>
          <Trans>Signed in successfully!</Trans>
        </Text>
        <Text ta="center" size="sm" c="dimmed">
          <Trans>Redirecting to your workspace...</Trans>
        </Text>
      </Stack>
    );
  }

  if (errorMessage) {
    return (
      <Stack gap="md" align="center">
        <IconAlertCircle size={48} color="var(--mantine-color-red-6)" />
        <Alert color="red" variant="light" role="alert" w="100%">
          {errorMessage}
        </Alert>
        <Group justify="center" mt="md">
          <Text component={Link} to="/magic-link" size="sm" c="blue.6">
            <Trans>Request a new magic link</Trans>
          </Text>
          <Text component={Link} to="/sign-in" size="sm" c="blue.6">
            <Trans>Back to sign-in</Trans>
          </Text>
        </Group>
      </Stack>
    );
  }

  return (
    <Stack gap="md" align="center">
      <IconLoader2 size={48} color="var(--mantine-color-blue-6)" />
      <Text ta="center" fw={500}>
        <Trans>Signing you in...</Trans>
      </Text>
      <Text ta="center" size="sm" c="dimmed">
        <Trans>Please wait while we verify your magic link.</Trans>
      </Text>
    </Stack>
  );
}
