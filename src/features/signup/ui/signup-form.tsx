import { Alert, Button, Stack, Text, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Controller, useWatch } from "react-hook-form";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import type { UseFormReturn } from "react-hook-form";
import type { SignupFormValues } from "../model/use-signup";
import { PasswordStrength } from "./password-strength";

interface SignupFormProps {
  form: UseFormReturn<SignupFormValues>;
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
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const password = useWatch({ control, name: "password" });
  const handleFormSubmit = handleSubmit((values: SignupFormValues) => onSubmit(values));

  return (
    <form onSubmit={(e) => void handleFormSubmit(e)} noValidate data-testid="sign-up-form">
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
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="signup-first-name"
                data-testid="sign-up-first-name-input"
                label={t`First name`}
                placeholder={t`Jane`}
                autoComplete="given-name"
                error={errors.firstName?.message}
                disabled={isLoading}
                style={{ flex: 1 }}
                inputWrapperOrder={["label", "input", "error"]}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <TextInput
                {...field}
                id="signup-last-name"
                data-testid="sign-up-last-name-input"
                label={t`Last name`}
                placeholder={t`Smith`}
                autoComplete="family-name"
                error={errors.lastName?.message}
                disabled={isLoading}
                style={{ flex: 1 }}
                inputWrapperOrder={["label", "input", "error"]}
              />
            )}
          />
        </Stack>

        {/* Email */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id="signup-email"
              data-testid="sign-up-email-input"
              label={t`Work email`}
              type="email"
              placeholder={t`you@company.com`}
              autoComplete="email"
              inputMode="email"
              error={errors.email?.message}
              disabled={isLoading}
              inputWrapperOrder={["label", "input", "error"]}
            />
          )}
        />

        {/* Password + strength meter */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Stack gap={0}>
              <TextInput
                {...field}
                id="signup-password"
                data-testid="sign-up-password-input"
                label={t`Password`}
                type="password"
                placeholder={t`At least 8 characters`}
                autoComplete="new-password"
                error={errors.password?.message}
                disabled={isLoading}
                inputWrapperOrder={["label", "input", "error"]}
              />
              <PasswordStrength password={password ?? ""} data-testid="sign-up-password-strength" />
            </Stack>
          )}
        />

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
