import { Alert, Button, Stack, Text, TextInput, PasswordInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import type { UseFormReturnType } from "@mantine/form";
import type { SignupFormValues } from "../model/use-signup";
import { PasswordStrength } from "./password-strength";

interface SignupFormProps {
  form: UseFormReturnType<SignupFormValues>;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (values: SignupFormValues) => Promise<void>;
}

/**
 * Step 1 — Account creation form.
 *
 * Single-screen form: first name, last name, email, password (with strength
 * meter). Submits to `POST /auth/signup`.
 */
export function SignupForm({ form, isLoading, errorMessage, onSubmit }: SignupFormProps) {
  const { t } = useLingui();

  const handleFormSubmit = form.onSubmit((values: SignupFormValues) => onSubmit(values));

  return (
    <form onSubmit={handleFormSubmit} noValidate data-testid="sign-up-form">
      <Stack gap="md">
        {/* Server-side error */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert
              icon={<IconAlertCircle size={16} />}
              color="red"
              variant="light"
              role="alert"
              data-testid="sign-up-error-alert"
            >
              {errorMessage}
            </Alert>
          )}
        </div>

        {/* Name row */}
        <Stack gap="md" style={{ flexDirection: "row" }}>
          <TextInput
            id="signup-first-name"
            data-testid="sign-up-first-name-input"
            label={t`First name`}
            placeholder={t`Jane`}
            autoComplete="given-name"
            disabled={isLoading}
            style={{ flex: 1 }}
            inputWrapperOrder={["label", "input", "error"]}
            {...form.getInputProps("firstName")}
          />
          <TextInput
            id="signup-last-name"
            data-testid="sign-up-last-name-input"
            label={t`Last name`}
            placeholder={t`Smith`}
            autoComplete="family-name"
            disabled={isLoading}
            style={{ flex: 1 }}
            inputWrapperOrder={["label", "input", "error"]}
            {...form.getInputProps("lastName")}
          />
        </Stack>

        {/* Email */}
        <TextInput
          id="signup-email"
          data-testid="sign-up-email-input"
          label={t`Work email`}
          type="email"
          placeholder={t`you@company.com`}
          autoComplete="email"
          inputMode="email"
          disabled={isLoading}
          inputWrapperOrder={["label", "input", "error"]}
          {...form.getInputProps("email")}
        />

        {/* Password + strength meter */}
        <Stack gap={0}>
          <PasswordInput
            id="signup-password"
            data-testid="sign-up-password-input"
            label={t`Password`}
            placeholder={t`At least 8 characters`}
            autoComplete="new-password"
            disabled={isLoading}
            inputWrapperOrder={["label", "input", "error"]}
            {...form.getInputProps("password")}
          />
          <PasswordStrength
            password={form.values.password}
            data-testid="sign-up-password-strength"
          />
        </Stack>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          mt={4}
          data-testid="sign-up-submit-button"
        >
          <Trans>Create account</Trans>
        </Button>

        <Text size="sm" c="dimmed" ta="center">
          <Trans>
            Already have an account?{" "}
            <Text
              component={Link}
              to="/sign-in"
              size="sm"
              c="blue.6"
              data-testid="sign-up-sign-in-link"
            >
              Sign in
            </Text>
          </Trans>
        </Text>
      </Stack>
    </form>
  );
}
