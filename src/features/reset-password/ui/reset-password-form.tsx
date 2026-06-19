import { Alert, Box, Button, Stack, Text, PasswordInput, ThemeIcon } from "@mantine/core";
import { IconAlertCircle, IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useResetPassword } from "../model/use-reset-password";
import type { ResetPasswordFormValues } from "../model/use-reset-password";

interface ResetPasswordFormProps {
  /** The single-use reset token from the URL query parameter. */
  token: string;
}

/**
 * Reset-password form.
 *
 * Renders new password + confirm password fields. On success, shows a
 * confirmation message and auto-redirects to sign-in after 3 seconds.
 * On 400 (invalid/expired token), shows an actionable error with a link
 * to request a new reset link.
 */
export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const { t } = useLingui();
  const { form, isLoading, isSuccess, errorMessage, onSubmit } = useResetPassword(token);

  const handleFormSubmit = form.onSubmit((values: ResetPasswordFormValues) => onSubmit(values));

  // ── No token provided ──────────────────────────────────────────────────────
  if (!token) {
    return (
      <Stack gap="md" align="center" ta="center" data-testid="reset-password-no-token">
        <ThemeIcon size={56} radius="xl" color="orange" variant="light">
          <IconAlertTriangle size={28} />
        </ThemeIcon>
        <Box>
          <Text fw={600} size="md" mb={4}>
            <Trans>Invalid reset link</Trans>
          </Text>
          <Text size="sm" c="dimmed">
            <Trans>This password reset link is missing a token. Please request a new one.</Trans>
          </Text>
        </Box>
        <Text size="sm">
          <Text
            component={Link}
            to="/forgot-password"
            size="sm"
            c="blue.6"
            data-testid="reset-password-no-token-new-link"
          >
            <Trans>Request a new reset link</Trans>
          </Text>
        </Text>
      </Stack>
    );
  }

  // ── Success state ──────────────────────────────────────────────────────────
  if (isSuccess) {
    return (
      <Stack gap="md" align="center" ta="center" data-testid="reset-password-success">
        <ThemeIcon size={56} radius="xl" color="green" variant="light">
          <IconCircleCheck size={28} />
        </ThemeIcon>
        <Box>
          <Text fw={600} size="md" mb={4}>
            <Trans>Password updated</Trans>
          </Text>
          <Text size="sm" c="dimmed">
            <Trans>
              Your password has been changed successfully. You'll be redirected to sign in shortly.
            </Trans>
          </Text>
        </Box>
        <Text size="sm" c="dimmed">
          <Trans>
            <Text
              component={Link}
              to="/sign-in"
              size="sm"
              c="blue.6"
              data-testid="reset-password-success-sign-in-link"
            >
              Sign in now
            </Text>
          </Trans>
        </Text>
      </Stack>
    );
  }

  // ── Form ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleFormSubmit} noValidate data-testid="reset-password-form">
      <Stack gap="md">
        {/* ARIA live region for server-side errors */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              role="alert"
              data-testid="reset-password-error-alert"
            >
              <Stack gap={4}>
                <Text size="sm">{errorMessage}</Text>
                <Text
                  component={Link}
                  to="/forgot-password"
                  size="sm"
                  c="blue.6"
                  style={{ display: "inline" }}
                  data-testid="reset-password-error-new-link"
                >
                  <Trans>Request a new reset link</Trans>
                </Text>
              </Stack>
            </Alert>
          )}
        </div>

        <PasswordInput
          id="reset-password-new"
          data-testid="reset-password-new-password-input"
          label={t`New password`}
          placeholder={t`At least 8 characters`}
          autoComplete="new-password"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("newPassword")}
        />

        <PasswordInput
          id="reset-password-confirm"
          data-testid="reset-password-confirm-password-input"
          label={t`Confirm new password`}
          placeholder={t`Repeat your new password`}
          autoComplete="new-password"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("confirmPassword")}
        />

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          data-testid="reset-password-submit-button"
        >
          <Trans>Set new password</Trans>
        </Button>

        <Text size="sm" c="dimmed" ta="center">
          <Trans>
            Remember your password?{" "}
            <Text
              component={Link}
              to="/sign-in"
              size="sm"
              c="blue.6"
              data-testid="reset-password-sign-in-link"
            >
              Sign in
            </Text>
          </Trans>
        </Text>
      </Stack>
    </form>
  );
}
