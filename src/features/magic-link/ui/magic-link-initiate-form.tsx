import { Alert, Button, Group, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle, IconMail } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useMagicLinkInitiate } from "../model";

export function MagicLinkInitiateForm() {
  const { t } = useLingui();
  const { form, isLoading, isEmailSent, errorMessage, onSubmit, onResend } = useMagicLinkInitiate();

  const handleFormSubmit = form.onSubmit((values) => onSubmit(values));

  if (isEmailSent) {
    return (
      <Stack gap="md">
        <Text ta="center">
          <IconMail size={48} color="var(--mantine-color-blue-6)" />
        </Text>
        <Text ta="center" fw={500}>
          <Trans>Check your email</Trans>
        </Text>
        <Text ta="center" size="sm" c="dimmed">
          <Trans>We've sent a magic link to your inbox. Click it to sign in!</Trans>
        </Text>
        <Group justify="center" mt="md">
          <Button variant="light" onClick={onResend} loading={isLoading}>
            <Trans>Resend magic link</Trans>
          </Button>
          <Text component={Link} to="/sign-in" size="sm" c="blue.6">
            <Trans>Back to sign-in</Trans>
          </Text>
        </Group>
      </Stack>
    );
  }

  return (
    <form onSubmit={handleFormSubmit} noValidate data-testid="magic-link-form">
      <Stack gap="md">
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" role="alert">
              {errorMessage}
            </Alert>
          )}
        </div>

        <TextInput
          id="magic-link-email"
          data-testid="magic-link-email-input"
          label={t`Email`}
          type="email"
          placeholder={t`you@example.com`}
          autoComplete="email"
          inputMode="email"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("email")}
        />

        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          <Trans>Send magic link</Trans>
        </Button>

        <Group justify="center" mt="md">
          <Text component={Link} to="/sign-in" size="sm" c="blue.6">
            <Trans>Sign in with password instead</Trans>
          </Text>
        </Group>
      </Stack>
    </form>
  );
}
