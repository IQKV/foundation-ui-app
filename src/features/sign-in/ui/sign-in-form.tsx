import { Alert, Button, Stack, TextInput } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { Trans, useLingui } from "@lingui/react/macro";
import { useSignIn } from "../model/use-sign-in";
import type { SignInFormValues } from "../model/use-sign-in";

interface SignInFormProps {
  /** Path to redirect to after successful sign-in. Defaults to "/admin". */
  redirectTo?: string;
}

/**
 * Sign-in form component.
 *
 * Renders email input, password input, and a submit button using Mantine v8
 * components (Requirement 8.1). Each input has a visible label with a for/id
 * relationship for screen reader accessibility (Requirement 8.4). Error
 * messages are rendered in an aria-live="polite" region (Requirement 8.5).
 */
export function SignInForm({ redirectTo }: SignInFormProps) {
  const { t } = useLingui();
  const { form, isLoading, errorMessage, onSubmit } = useSignIn(redirectTo);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleFormSubmit = handleSubmit((values: SignInFormValues) => onSubmit(values));

  return (
    <form onSubmit={(e) => void handleFormSubmit(e)} noValidate>
      <Stack gap="md">
        {/* ARIA live region for server-side error messages (Requirement 8.5) */}
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" role="alert">
              {errorMessage}
            </Alert>
          )}
        </div>

        {/* Email field — label/id relationship satisfies Requirement 8.4 */}
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id="sign-in-email"
              label={t`Email`}
              type="email"
              placeholder={t`you@example.com`}
              autoComplete="email"
              inputMode="email"
              error={errors.email?.message}
              disabled={isLoading}
              inputWrapperOrder={["label", "input", "error"]}
            />
          )}
        />

        {/* Password field — label/id relationship satisfies Requirement 8.4 */}
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id="sign-in-password"
              label={t`Password`}
              type="password"
              placeholder={t`Your password`}
              autoComplete="current-password"
              error={errors.password?.message}
              disabled={isLoading}
              inputWrapperOrder={["label", "input", "error"]}
            />
          )}
        />

        {/* Submit button — disabled and shows loading indicator while in flight (Requirement 1.11) */}
        <Button type="submit" fullWidth loading={isLoading} disabled={isLoading}>
          <Trans>Sign in</Trans>
        </Button>
      </Stack>
    </form>
  );
}
