import { Alert, Button, Card, Group, Stack, Text, TextInput, UnstyledButton } from "@mantine/core";
import { IconAlertCircle, IconBuilding, IconUser, IconShieldHalf } from "@tabler/icons-react";
import { Controller } from "react-hook-form";
import { Trans, useLingui } from "@lingui/react/macro";
import { Link } from "@tanstack/react-router";
import { useSignIn } from "../model/use-sign-in";
import type { SignInFormValues } from "../model/use-sign-in";

interface SignInFormProps {
  /** Path to redirect to after successful sign-in. Defaults to "/dashboard". */
  redirectTo?: string;
}

/**
 * Two-step sign-in form:
 * 1. Email + password → discovers tenant memberships
 * 2. Tenant picker (only shown when user belongs to multiple tenants)
 */
export function SignInForm({ redirectTo }: SignInFormProps) {
  const { t } = useLingui();
  const { form, step, tenants, isLoading, errorMessage, onSubmitCredentials, onSelectTenant } =
    useSignIn(redirectTo);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const handleFormSubmit = handleSubmit((values: SignInFormValues) => onSubmitCredentials(values));

  // ── Step 2: tenant picker ──────────────────────────────────────────────────
  if (step === "tenant-select") {
    return (
      <Stack gap="md" data-testid="sign-in-tenant-picker">
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" role="alert">
              {errorMessage}
            </Alert>
          )}
        </div>

        <Text size="sm" c="dimmed" ta="center">
          <Trans>Select the workspace you want to sign in to.</Trans>
        </Text>

        <Stack gap="xs">
          {tenants.map((tenant) => {
            const { isPersonal, isInternal } = tenant;
            const icon = isInternal ? (
              <IconShieldHalf size={18} color="var(--mantine-color-red-6)" />
            ) : isPersonal ? (
              <IconUser size={18} color="var(--mantine-color-green-6)" />
            ) : (
              <IconBuilding size={18} color="var(--mantine-color-blue-6)" />
            );
            return (
              <UnstyledButton
                key={tenant.tenantKey}
                onClick={() => void onSelectTenant(tenant.tenantKey)}
                disabled={isLoading}
                data-testid={`tenant-picker-${tenant.tenantKey}`}
                style={{ width: "100%" }}
              >
                <Card withBorder radius="md" p="md" style={{ cursor: "pointer" }}>
                  <Stack gap={4} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                    {icon}
                    <Stack gap={2}>
                      <Text size="sm" fw={500}>
                        {tenant.tenantName}
                      </Text>
                      {!isPersonal && !isInternal && (
                        <Text size="xs" c="dimmed">
                          {tenant.authorities.join(", ")}
                        </Text>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              </UnstyledButton>
            );
          })}
        </Stack>
      </Stack>
    );
  }

  // ── Step 1: credentials ────────────────────────────────────────────────────
  return (
    <form onSubmit={(e) => void handleFormSubmit(e)} noValidate data-testid="sign-in-form">
      <Stack gap="md">
        <div aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" role="alert">
              {errorMessage}
            </Alert>
          )}
        </div>

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id="sign-in-email"
              data-testid="sign-in-email-input"
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

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <TextInput
              {...field}
              id="sign-in-password"
              data-testid="sign-in-password-input"
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

        {/* Forgot password link */}
        <Group justify="flex-end" mt={-8}>
          <Text component={Link} to="/forgot-password" size="sm" c="blue.6">
            <Trans>Forgot password?</Trans>
          </Text>
        </Group>

        <Button
          type="submit"
          fullWidth
          loading={isLoading}
          disabled={isLoading}
          data-testid="sign-in-submit-button"
        >
          <Trans>Continue</Trans>
        </Button>
      </Stack>
    </form>
  );
}
