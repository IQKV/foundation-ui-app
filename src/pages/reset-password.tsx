import { createFileRoute, redirect } from "@tanstack/react-router";
import { Box, Text, Title } from "@mantine/core";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { ResetPasswordForm } from "@/features/reset-password";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";

// ─── Search params schema ─────────────────────────────────────────────────────

const resetPasswordSearchSchema = z.object({
  /** Single-use reset token from the email link. */
  token: z.string().optional(),
});

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/reset-password")({
  validateSearch: resetPasswordSearchSchema,

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

  component: ResetPasswordPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function ResetPasswordPage() {
  const { t } = useLingui();
  const { token } = Route.useSearch();

  return (
    <AuthLayout
      headline={
        <>
          <Trans>Set a new</Trans>
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
            <Trans>password.</Trans>
          </Text>
        </>
      }
      tagline={
        <Trans>
          Choose a strong password with at least 8 characters, including uppercase, lowercase, a
          number, and a special character.
        </Trans>
      }
    >
      <Helmet>
        <title>{pageTitle(t`Reset Password`)}</title>
      </Helmet>

      {/* Heading */}
      <Box>
        <Title order={2} fw={700} size="h3" mb={6}>
          <Trans>Choose a new password</Trans>
        </Title>
        <Text c="dimmed" size="sm">
          <Trans>Your new password must be different from your previous one.</Trans>
        </Text>
      </Box>

      {/* Form — token may be undefined if the user navigated here directly */}
      <ResetPasswordForm token={token ?? ""} />
    </AuthLayout>
  );
}
