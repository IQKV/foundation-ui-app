import { createFileRoute, redirect } from "@tanstack/react-router";
import { Alert, Box, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";

import { Link } from "@tanstack/react-router";
import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { SignInForm } from "@/features/sign-in";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";

// ─── Search params schema ─────────────────────────────────────────────────────

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
  reason: z.enum(["timeout", "forbidden"]).optional(),
});

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/sign-in")({
  validateSearch: signInSearchSchema,

  beforeLoad: () => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && isTenantSession(payload)) {
        throw redirect({ to: "/" });
      }
    }
  },

  component: SignInPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function SignInPage() {
  const { t } = useLingui();
  const { redirect: redirectTo, reason } = Route.useSearch();

  return (
    <AuthLayout>
      <PageTitle segments={[t`Sign In`]} />

      {/* Heading */}
      <Box>
        <Title order={2} fw={700} size="h3" mb={6}>
          <Trans>Welcome back</Trans>
        </Title>
        <Text c="dimmed" size="sm">
          <Trans>Sign in to your workspace to continue.</Trans>
        </Text>
      </Box>

      {/* Reason-based contextual alerts */}
      {reason === "timeout" && (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          aria-live="polite"
          aria-atomic="true"
        >
          <Trans>Your session expired due to inactivity.</Trans>
        </Alert>
      )}

      {reason === "forbidden" && (
        <Alert
          icon={<IconAlertCircle size={16} />}
          color="orange"
          variant="light"
          aria-live="polite"
          aria-atomic="true"
        >
          <Trans>You do not have permission to access this area.</Trans>
        </Alert>
      )}

      {/* Two-step form: credentials → tenant picker */}
      <SignInForm redirectTo={redirectTo} />

      {/* Footer */}
      <Text size="xs" c="dimmed" ta="center">
        <Trans>
          Don't have an account?{" "}
          <Text component={Link} to="/signup" size="xs" c="blue.6">
            Create one
          </Text>
        </Trans>
      </Text>
    </AuthLayout>
  );
}
