import { createFileRoute, redirect } from "@tanstack/react-router";
import { Box, Text, Title } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { SignupForm, VerifyEmailPrompt, useSignup } from "@/features/signup";
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

// ─── Page ─────────────────────────────────────────────────────────────────────

function SignupPage() {
  const { t } = useLingui();
  const {
    form,
    phase,
    isLoading,
    errorMessage,
    submittedEmail,
    onSubmit,
    onEnterWorkspace,
    onResendVerification,
    resendCooldown,
  } = useSignup();

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
          <Trans>Create your account in seconds. No credit card required.</Trans>
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
              <Trans>Set up your account in under a minute.</Trans>
            ) : (
              <Trans>Set up your account in under a minute.</Trans>
            )}
          </Text>
        </Box>
      )}

      {/* Step content */}
      {phase === "form" && (
        <SignupForm
          form={form}
          isLoading={isLoading}
          errorMessage={errorMessage}
          onSubmit={onSubmit}
        />
      )}

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
