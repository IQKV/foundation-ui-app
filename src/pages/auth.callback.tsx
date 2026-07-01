import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Alert, Box, Center, Loader, Stack, Text, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";

import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { consumePostAuthRedirect } from "@/shared/lib/oauth2-post-auth";
import { iamApi } from "@/shared/api";
import { setTokens } from "@/processes/session";

export const Route = createFileRoute("/auth/callback")({
  component: OAuth2CallbackPage,
});

function normalizeRedirectTarget(target: string | null): string {
  if (!target) return "/";
  if (target.startsWith("/")) return target;
  try {
    const u = new URL(target);
    return `${u.pathname}${u.search}`;
  } catch {
    return "/";
  }
}

function OAuth2CallbackPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "";
      const params = new URLSearchParams(hash);

      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const tenantKey = params.get("tenant_key");
      const linkStatus = params.get("link_status");
      const provider = params.get("provider");
      const errorCode = params.get("error");
      const errorDescription = params.get("error_description");

      window.history.replaceState(null, "", window.location.pathname + window.location.search);

      const redirectTarget = normalizeRedirectTarget(consumePostAuthRedirect());

      if (accessToken && refreshToken && tenantKey) {
        setTokens(accessToken, refreshToken, tenantKey, false);

        try {
          const tenant = await iamApi.getTenant(tenantKey);
          setTokens(
            accessToken,
            refreshToken,
            tenantKey,
            Boolean(tenant.isInternal || tenant.isPersonal),
          );
        } catch {}

        notifications.show({
          title: t`Signed in`,
          message: t`Welcome back.`,
          color: "green",
          icon: <IconCheck size={16} />,
        });

        await navigate({ to: redirectTarget });
        return;
      }

      if (linkStatus === "success") {
        notifications.show({
          title: t`Account linked`,
          message: provider ? `${t`Connected`} ${provider}.` : t`Account linked successfully.`,
          color: "green",
          icon: <IconCheck size={16} />,
        });
        await navigate({ to: redirectTarget || "/_app/settings/security" });
        return;
      }

      if (errorCode) {
        setError(errorDescription || errorCode);
        return;
      }

      await navigate({ to: "/sign-in" });
    };

    void run();
  }, [navigate, t]);

  return (
    <AuthLayout>
      <PageTitle segments={[t`Signing in`]} />

      <Stack gap="md">
        <Box>
          <Title order={2} fw={700} size="h3" mb={6}>
            <Trans>Completing sign-in</Trans>
          </Title>
          <Text c="dimmed" size="sm">
            <Trans>Please wait while we finish signing you in.</Trans>
          </Text>
        </Box>

        {error ? (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
            title={t`Authentication failed`}
          >
            {error}
          </Alert>
        ) : (
          <Center mih={72}>
            <Loader size="md" />
          </Center>
        )}
      </Stack>
    </AuthLayout>
  );
}
