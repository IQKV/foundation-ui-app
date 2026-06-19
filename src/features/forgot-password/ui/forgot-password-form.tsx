import { Alert, Box, Button, Stack, Text, TextInput, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconMailCheck } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useForgotPassword } from "../model/use-forgot-password";
import type { ForgotPasswordFormValues } from "../model/use-forgot-password";

/**
 * Forgot-password form.
 *
 * Renders an email input and submit button. On success, replaces the form with
 * a confirmation message — the API always returns 200 to prevent email
 * enumeration, so we show the same message regardless of whether the address
 * is registered.
 */
export function ForgotPasswordForm() {
  const { t } = useLingui();
  const { form, isLoading, isSubmitted, errorMessage, onSubmit } = useForgotPassword();

  const handleFormSubmit = form.onSubmit((values: ForgotPasswordFormValues) => onSubmit(values));

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSubmitted) {
    return (
      <Stack gap="md" align="center" ta="center" data-testid="forgot-password-success">
        <ThemeIcon size={56} radius="xl" color="green" variant="light">
          <IconMailCheck size={28} />
        </ThemeIcon>

        <Box>
          <Text fw={600} size="md" mb={4}>
            <Trans>Check your inbox</Trans>
          </Text>
          <Text size="sm" c="dimmed">
            <Trans>
              If <strong>{form.values.email}</strong> is registered, you'll receive a password reset
              link shortly. Check your spam folder if you don't see it.
            </Trans>
          </Text>
        </Box>

        <Text size="sm" c="dimmed">
          <Trans>
            Back to{" "}
            <Text
              component={Link}
              to="/sign-in"
              size="sm"
              c="blue.6"
              data-testid="forgot-password-success-sign-in-link"
            >
              Sign in
            </Text>
          </Trans>
        </Text>
      </Stack>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleFormSubmit} noValidate data-testid="forgot-password-form">
      <Stack gap="md">
        {/* ARIA live region for server-side errors */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              role="alert"
              data-testid="forgot-password-error-alert"
            >
              {errorMessage}
            </Alert>
          )}
        </div>

        <Text size="sm" c="dimmed">
          <Trans>
            Enter the email address associated with your account and we'll send you a link to reset
            your password.
          </Trans>
        </Text>

        <TextInput
          id="forgot-password-email"
          data-testid="forgot-password-email-input"
          label={t`Email`}
          type="email"
          placeholder={t`you@example.com`}
          autoComplete="email"
          inputMode="email"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("email")}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          data-testid="forgot-password-submit-button"
        >
          <Trans>Send reset link</Trans>
        </Button>

        <Text size="sm" c="dimmed" ta="center">
          <Trans>
            Remember your password?{" "}
            <Text
              component={Link}
              to="/sign-in"
              size="sm"
              c="blue.6"
              data-testid="forgot-password-sign-in-link"
            >
              Sign in
            </Text>
          </Trans>
        </Text>
      </Stack>
    </form>
  );
}
