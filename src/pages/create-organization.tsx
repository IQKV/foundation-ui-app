import { createFileRoute, redirect } from "@tanstack/react-router";
import { Box, Text, Title } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { CreateOrganizationForm, useCreateOrganization } from "@/features/create-organization";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/create-organization")({
  beforeLoad: () => {
    const token = getAccessToken();
    if (!token) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: CreateOrganizationPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function CreateOrganizationPage() {
  const { t } = useLingui();
  const { form, isLoading, errorMessage, onSubmit } = useCreateOrganization();

  return (
    <AuthLayout
      headline={
        <>
          <Trans>Create your</Trans>
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
            <Trans>organization</Trans>
          </Text>
        </>
      }
      tagline={<Trans>Set up your workspace in under a minute.</Trans>}
    >
      <Helmet>
        <title>{pageTitle(t`Create organization`)}</title>
      </Helmet>

      {/* Heading */}
      <Box>
        <Title order={2} fw={700} size="h3" mb={6}>
          <Trans>Create your organization</Trans>
        </Title>
        <Text c="dimmed" size="sm">
          <Trans>Set up your workspace in under a minute.</Trans>
        </Text>
      </Box>

      {/* Form */}
      <CreateOrganizationForm
        form={form}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onSubmit={onSubmit}
      />
    </AuthLayout>
  );
}
