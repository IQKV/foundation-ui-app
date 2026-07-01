import { createFileRoute, redirect } from "@tanstack/react-router";
import { Alert, Box, Button, Divider, Group, Stack, Text, TextInput, Title } from "@mantine/core";
import {
  IconAlertCircle,
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandWindows,
  IconInfoCircle,
  IconLock,
} from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";

import { Link } from "@tanstack/react-router";
import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { SignInForm } from "@/features/sign-in";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";
import { buildOAuth2AuthorizeUrl, oauth2Api } from "@/shared/api";
import { storePostAuthRedirect } from "@/shared/lib/oauth2-post-auth";

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
  const [ssoTenantKey, setSsoTenantKey] = useState("");

  const { data: oauth2Providers = [], isLoading: oauth2ProvidersLoading } = useQuery({
    queryKey: ["oauth2", "providers"],
    queryFn: () => oauth2Api.listEnabledProviders(),
    staleTime: 5 * 60_000,
  });

  const normalizedRedirect = (() => {
    if (!redirectTo) return "/";
    if (redirectTo.startsWith("/")) return redirectTo;
    try {
      const u = new URL(redirectTo);
      return `${u.pathname}${u.search}`;
    } catch {
      return "/";
    }
  })();

  const startOAuth2 = (provider: string, tenantKey?: string) => {
    storePostAuthRedirect(normalizedRedirect);
    window.location.href = buildOAuth2AuthorizeUrl(provider, tenantKey);
  };

  const providerButton = (provider: string) => {
    const icon =
      provider === "google" ? (
        <IconBrandGoogle size={18} />
      ) : provider === "github" ? (
        <IconBrandGithub size={18} />
      ) : provider === "microsoft" ? (
        <IconBrandWindows size={18} />
      ) : null;
    const label =
      provider === "google"
        ? t`Continue with Google`
        : provider === "github"
          ? t`Continue with GitHub`
          : provider === "microsoft"
            ? t`Continue with Microsoft`
            : `${t`Continue with`} ${provider}`;

    return (
      <Button
        key={provider}
        variant="default"
        fullWidth
        leftSection={icon}
        onClick={() => startOAuth2(provider)}
        disabled={oauth2ProvidersLoading}
        data-testid={`sign-in-oauth2-${provider}`}
      >
        {label}
      </Button>
    );
  };

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

      {oauth2Providers.length > 0 && (
        <Stack gap="sm">
          <Divider
            label={t`or`}
            labelPosition="center"
            styles={{ label: { color: "var(--mantine-color-dimmed)" } }}
          />
          <Group grow>
            <Stack gap="sm" style={{ width: "100%" }}>
              {oauth2Providers.map(providerButton)}
            </Stack>
          </Group>
        </Stack>
      )}

      <Stack gap="sm">
        <Divider
          label={t`Enterprise SSO`}
          labelPosition="center"
          styles={{ label: { color: "var(--mantine-color-dimmed)" } }}
        />
        <TextInput
          label={t`Workspace key`}
          placeholder={t`Example: acme1234`}
          value={ssoTenantKey}
          onChange={(e) => setSsoTenantKey(e.currentTarget.value)}
          data-testid="sign-in-sso-tenant-key"
        />
        <Button
          variant="default"
          fullWidth
          leftSection={<IconLock size={18} />}
          disabled={!ssoTenantKey.trim()}
          onClick={() => startOAuth2(`oidc:${ssoTenantKey.trim()}`, ssoTenantKey.trim())}
          data-testid="sign-in-sso-submit"
        >
          <Trans>Continue with SSO</Trans>
        </Button>
        <Text size="xs" c="dimmed">
          <Trans>
            Use this if your organization configured a custom OIDC provider for tenant sign-in.
          </Trans>
        </Text>
      </Stack>

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
