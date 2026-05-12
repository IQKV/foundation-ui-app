import { createFileRoute, redirect } from "@tanstack/react-router";
import { Alert, Box, Center, Container, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle, APP_NAME } from "@/shared/lib/page-title";
import { SignInForm } from "@/features/sign-in";
import { decodeJwt, hasPlatformAdmin } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";

// ─── Search params schema ─────────────────────────────────────────────────────

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
  reason: z.enum(["timeout", "forbidden"]).optional(),
});

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/sign-in")({
  validateSearch: signInSearchSchema,

  /**
   * If the admin is already authenticated with PLATFORM_ADMIN authority,
   * skip the sign-in page and go straight to /admin (Requirement 1.14).
   */
  beforeLoad: () => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && hasPlatformAdmin(payload)) {
        throw redirect({ to: "/admin" });
      }
    }
  },

  component: SignInPage,
});

// ─── Page component ───────────────────────────────────────────────────────────

function SignInPage() {
  const { t } = useLingui();
  const { redirect: redirectTo, reason } = Route.useSearch();

  return (
    <Center mih="100vh" bg="gray.0">
      <Helmet>
        <title>{pageTitle(t`Sign In`)}</title>
      </Helmet>
      <Container size={420} w="100%">
        <Stack gap="xl">
          {/* Application name / branding — Requirement 8.6 */}
          <Box ta="center">
            <Title order={1} size="h2" fw={700}>
              {APP_NAME}
            </Title>
            <Text c="dimmed" size="sm" mt={4}>
              <Trans>Platform administration</Trans>
            </Text>
          </Box>

          {/* Reason-based contextual messages — Requirements 1.16, 1.17 */}
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
              <Trans>You do not have permission to access the admin area.</Trans>
            </Alert>
          )}

          {/* Sign-in form — Requirement 1.1 */}
          <SignInForm redirectTo={redirectTo} />
        </Stack>
      </Container>
    </Center>
  );
}
