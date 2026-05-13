import { createFileRoute, Link } from "@tanstack/react-router";
import { Button, Center, Container, Stack, Text, Title } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { SignOutButton } from "@/features/sign-out";

export const Route = createFileRoute("/unauthorized")({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const { t } = useLingui();
  return (
    <Center mih="100vh" bg="gray.0">
      <Helmet>
        <title>{pageTitle(t`Access Denied`)}</title>
      </Helmet>
      <Container size="sm">
        <Stack align="center" gap="md">
          <Title order={1}>
            <Trans>Access Denied</Trans>
          </Title>
          <Text c="dimmed" ta="center">
            <Trans>
              You do not have permission to access this area. Please sign in with an account that
              has the appropriate membership.
            </Trans>
          </Text>

          <Button component={Link} to="/" variant="default">
            <Trans>Go to Home</Trans>
          </Button>

          <SignOutButton />
        </Stack>
      </Container>
    </Center>
  );
}
