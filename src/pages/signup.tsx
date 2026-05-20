import { createFileRoute, redirect } from "@tanstack/react-router";
import { Box, Stepper, Text, Title } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { ProvisioningWait, SignupForm, VerifyEmailPrompt, useSignup } from "@/features/signup";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";
import { isMultiTenantMode } from "@/app/config";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/signup")({
  beforeLoad: () => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && isTenantSession(payload)) {
        throw redirect({ to: "/" });
      }
    }
  },
  component: SignupPage,
});

// ─── Step index map ───────────────────────────────────────────────────────────

const PHASE_TO_STEP = { form: 0, provisioning: 1, "verify-email": 2 } as const;

// ─── Page ─────────────────────────────────────────────────────────────────────

function SignupPage() {
  const { t } = useLingui();
  const {
    form,
    phase,
    isLoading,
    isProvisioningTimeout,
    errorMessage,
    submittedEmail,
    onSubmit,
    onEnterWorkspace,
    onResendVerification,
    resendCooldown,
  } = useSignup();

  const activeStep = PHASE_TO_STEP[phase];

  return (
    <AuthLayout
      headline={
        <>
          <Trans>Start building</Trans>
          <br />
          <Text
            component="span"
            inherit
            style={{
              background: "linear-gradient(90deg, #60a5fa, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <Trans>something great.</Trans>
          </Text>
        </>
      }
      tagline={
        isMultiTenantMode ? (
          <Trans>Create your account and workspace in seconds. No credit card required.</Trans>
        ) : (
          <Trans>
            Create your account and join the platform in seconds. No credit card required.
          </Trans>
        )
      }
    >
      <Helmet>
        <title>{pageTitle(t`Create account`)}</title>
      </Helmet>

      {/* Heading — only shown on the form step */}
      {phase === "form" && (
        <Box>
          <Title order={2} fw={700} size="h3" mb={6}>
            <Trans>Create your account</Trans>
          </Title>
          <Text c="dimmed" size="sm">
            {isMultiTenantMode ? (
              <Trans>Set up your workspace in under a minute.</Trans>
            ) : (
              <Trans>Set up your account in under a minute.</Trans>
            )}
          </Text>
        </Box>
      )}

      {/* Step progress indicator */}
      <Stepper
        active={activeStep}
        size="xs"
        color="blue"
        styles={{
          stepLabel: { fontSize: "var(--mantine-font-size-xs)" },
          stepDescription: { fontSize: "var(--mantine-font-size-xs)" },
        }}
      >
        <Stepper.Step
          label={t`Account`}
          description={t`Your details`}
          aria-label={t`Step 1: Create account`}
        />
        <Stepper.Step
          label={t`Workspace`}
          description={t`Setting up`}
          loading={phase === "provisioning"}
          aria-label={t`Step 2: Workspace setup`}
        />
        <Stepper.Step
          label={t`Verify`}
          description={t`Check email`}
          aria-label={t`Step 3: Verify email`}
        />
      </Stepper>

      {/* Step content */}
      {phase === "form" && (
        <SignupForm
          form={form}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
        />
      )}

      {phase === "provisioning" && <ProvisioningWait isTimeout={isProvisioningTimeout} />}

      {phase === "verify-email" && (
        <VerifyEmailPrompt
          email={submittedEmail}
          isLoading={isLoading}
          resendCooldown={resendCooldown}
          onEnterWorkspace={onEnterWorkspace}
          onResendVerification={onResendVerification}
        />
      )}
    </AuthLayout>
  );
}
