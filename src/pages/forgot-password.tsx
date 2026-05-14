import { createFileRoute, redirect } from "@tanstack/react-router";
import { Box, Text, Title } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { ForgotPasswordForm } from "@/features/forgot-password";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/forgot-password")({
  /**
   * If the user is already authenticated, redirect them to the app.
   * There's no reason to reset a password while signed in.
   */
  beforeLoad: () => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && isTenantSession(payload)) {
        throw redirect({ to: "/" });
      }
    }
  },

  component: ForgotPasswordPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function ForgotPasswordPage() {
  const { t } = useLingui();

  return (
    <AuthLayout
      headline={
        <>
          <Trans>Forgot your</Trans>
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
            <Trans>password?</Trans>
          </Text>
        </>
      }
      tagline={
        <Trans>No worries — enter your email and we'll send you a secure link to reset it.</Trans>
      }
    >
      <Helmet>
        <title>{pageTitle(t`Forgot Password`)}</title>
      </Helmet>

      {/* Heading */}
      <Box>
        <Title order={2} fw={700} size="h3" mb={6}>
          <Trans>Reset your password</Trans>
        </Title>
        <Text c="dimmed" size="sm">
          <Trans>We'll send a reset link to your email address.</Trans>
        </Text>
      </Box>

      {/* Form */}
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
