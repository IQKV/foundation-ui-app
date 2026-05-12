import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { SignOutButton } from "@/features/sign-out";

// ─── Route ────────────────────────────────────────────────────────────────────

/**
 * No `beforeLoad` guard — this page must be reachable without triggering the
 * admin route guard (Requirement 4.3, 4.6).
 */
export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

// ─── Page component ───────────────────────────────────────────────────────────

function UnauthorizedPage() {
  const { t } = useLingui();
  return (
    <Center mih="100vh" bg="gray.0">
      <Helmet>
        <title>{pageTitle(t`Access Denied`)}</title>
      </Helmet>
      <Container size="sm">
        <Stack align="center" gap="md">
          {/* Requirement 4.2 — heading and explanatory message */}
          <Title order={1}>
            <Trans>Access Denied</Trans>
          </Title>
          <Text c="dimmed" ta="center">
            <Trans>
              You do not have the required <strong>PLATFORM_ADMIN</strong> authority to access this
              area. Please sign in with an account that has the appropriate permissions.
            </Trans>
          </Text>

          {/* Requirement 4.4 — link back to application home */}
          <Button component={Link} to="/" variant="default">
            <Trans>Go to Home</Trans>
          </Button>

          {/* Requirement 4.5 — sign-out action */}
          <SignOutButton />
        </Stack>
      </Container>
    </Center>
  );
}
