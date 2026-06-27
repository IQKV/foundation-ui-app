import { createFileRoute } from "@tanstack/react-router";
import { Box, Text, Title } from "@mantine/core";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";

import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { MagicLinkInitiateForm } from "@/features/magic-link";

const magicLinkSearchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/magic-link/")({
  validateSearch: magicLinkSearchSchema,
  component: MagicLinkPage,
});

function MagicLinkPage() {
  const { t } = useLingui();

  return (
    <AuthLayout>
      <PageTitle segments={[t`Sign in with magic link`]} />

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
