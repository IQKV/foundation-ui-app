import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Box, Button, Loader, Stack, Text, ThemeIcon, Title } from "@mantine/core";
import { IconAlertTriangle, IconCircleCheck } from "@tabler/icons-react";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { Link } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { httpClient } from "@/shared/api/http-client";

// ─── Search params schema ─────────────────────────────────────────────────────

const verifyEmailSearchSchema = z.object({
  token: z.string().optional(),
});

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/verify-email")({
  validateSearch: verifyEmailSearchSchema,
  component: VerifyEmailPage,
});

// ─── States ───────────────────────────────────────────────────────────────────

type VerifyState = "loading" | "success" | "invalid" | "no-token";

// ─── Page ─────────────────────────────────────────────────────────────────────

function VerifyEmailPage() {
  const { t } = useLingui();
  const { token } = Route.useSearch();
  const [state, setState] = useState<VerifyState>(token ? "loading" : "no-token");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    httpClient
      .post("/v1/iam/users/email/verify", { token })
      .then(() => {
        if (!cancelled) setState("success");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
        // 400 = invalid/expired token; anything else = treat as invalid too
        setState(status === 400 || status === 0 ? "invalid" : "invalid");
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <AuthLayout
      headline={
        <>
          <Trans>Confirm your</Trans>
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
            <Trans>email address.</Trans>
          </Text>
        </>
      }
      tagline={<Trans>One click and you're all set.</Trans>}
    >
      <Helmet>
        <title>{pageTitle(t`Verify Email`)}</title>
      </Helmet>

      <Box>
        <Title order={2} fw={700} size="h3" c="dark.8" mb={6}>
          <Trans>Email verification</Trans>
        </Title>
      </Box>

      {/* Loading */}
      {state === "loading" && (
        <Stack gap="md" align="center" ta="center">
          <Loader size="lg" color="blue" type="dots" />
          <Text size="sm" c="dimmed">
            <Trans>Verifying your email address…</Trans>
          </Text>
        </Stack>
      )}

      {/* Success */}
      {state === "success" && (
        <Stack gap="lg" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color="green" variant="light">
            <IconCircleCheck size={32} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="md" mb={4}>
              <Trans>Email verified</Trans>
            </Text>
            <Text size="sm" c="dimmed">
              <Trans>Your email address has been confirmed. You're all set.</Trans>
            </Text>
          </Box>
          <Button component={Link} to="/sign-in" fullWidth>
            <Trans>Sign in to your workspace</Trans>
          </Button>
        </Stack>
      )}

      {/* Invalid / expired token */}
      {state === "invalid" && (
        <Stack gap="lg" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color="red" variant="light">
            <IconAlertTriangle size={32} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="md" mb={4}>
              <Trans>Link expired or invalid</Trans>
            </Text>
            <Text size="sm" c="dimmed">
              <Trans>
                This verification link has expired or has already been used. Request a new one from
                your account settings.
              </Trans>
            </Text>
          </Box>
          <Button component={Link} to="/sign-in" variant="outline" fullWidth>
            <Trans>Back to sign in</Trans>
          </Button>
        </Stack>
      )}

      {/* No token in URL */}
      {state === "no-token" && (
        <Stack gap="lg" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color="orange" variant="light">
            <IconAlertTriangle size={32} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="md" mb={4}>
              <Trans>Invalid verification link</Trans>
            </Text>
            <Text size="sm" c="dimmed">
              <Trans>
                This link is missing a verification token. Please use the link from your email.
              </Trans>
            </Text>
          </Box>
          <Button component={Link} to="/sign-in" variant="outline" fullWidth>
            <Trans>Back to sign in</Trans>
          </Button>
        </Stack>
      )}
    </AuthLayout>
  );
}
