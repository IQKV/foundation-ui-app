import { createFileRoute, redirect } from "@tanstack/react-router";
import { Alert, Box, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { Link } from "@tanstack/react-router";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { MagicLinkInitiateForm } from "@/features/magic-link";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";
import { isMagicLinkEnabled } from "@/app/config/runtime-env";

const magicLinkSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/magic-link")({
  validateSearch: magicLinkSearchSchema,

  beforeLoad: () => {
    if (!isMagicLinkEnabled) {
      throw redirect({ to: "/sign-in" });
    }
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && isTenantSession(payload)) {
        throw redirect({ to: "/" });
      }
    }
  },

  component: MagicLinkPage,
});

function MagicLinkPage() {
  const { t } = useLingui();

  return (
    <AuthLayout>
      <Helmet>
        <title>{pageTitle(t`Sign in with magic link`)}</title>
      </Helmet>

      {/* Heading */}
      <Box>
        <Title order={2} fw={700} size="h3" mb={6}>
          <Trans>Sign in with magic link</Trans>
        </Title>
        <Text c="dimmed" size="sm">
          <Trans>Enter your email and we'll send you a magic link to sign in.</Trans>
        </Text>
      </Box>

      {/* Form */}
      <MagicLinkInitiateForm />
    </AuthLayout>
  );
}
