import { createFileRoute, redirect, useRouter } from "@tanstack/react-router";
import { Avatar, Box, Button, Divider, Group, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { CreateOrganizationForm, useCreateOrganization } from "@/features/create-organization";
import { decodeJwt } from "@/shared/lib/jwt";
import { getAccessToken, useSessionStore } from "@/processes/session";
import { iamApi } from "@/shared/api";
import { guardMultiTenantRoute } from "@/app/config";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/create-organization")({
  beforeLoad: () => {
    guardMultiTenantRoute();
    const token = getAccessToken();
    if (!token) {
      throw redirect({ to: "/sign-in" });
    }
  },
  component: CreateOrganizationPage,
});

// ─── Owner card ───────────────────────────────────────────────────────────────

function OwnerCard() {
  const accessToken = useSessionStore((s) => s.accessToken);
  const payload = accessToken ? decodeJwt(accessToken) : null;
  const router = useRouter();

  const { data: profile } = useQuery({
    queryKey: ["me"],
    queryFn: () => iamApi.getMe(),
    enabled: !!accessToken,
  });

  if (!payload) return null;

  const firstName = payload.firstName ?? "";
  const lastName = payload.lastName ?? "";
  const initials =
    [firstName, lastName]
      .map((s) => s.trim().charAt(0))
      .join("")
      .toUpperCase() || "?";
  const displayName = `${firstName} ${lastName}`.trim() || payload.email;

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Group gap="sm">
          <Avatar src={profile?.avatarUrl} size={40} radius="xl" color="blue" variant="filled">
            {initials}
          </Avatar>
          <Box>
            <Text size="sm" fw={600} lh={1.3}>
              {displayName}
            </Text>
            <Text size="xs" c="dimmed" lh={1.3}>
              {payload.email}
            </Text>
          </Box>
        </Group>
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          leftSection={<IconArrowLeft size={13} />}
          onClick={() => router.history.back()}
        >
          <Trans>Back</Trans>
        </Button>
      </Group>
      <Divider />
    </Stack>
  );
}

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

      {/* Owner card — shows who will own the new org */}
      <OwnerCard />

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
