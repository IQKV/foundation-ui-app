import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  const { t } = useLingui();
  return (
    <Container size="sm" py="xl">
      <Helmet>
        <title>{t`Page Not Found |Key Value Admin`}</title>
      </Helmet>
      <Stack align="center" gap="md">
        <Title>404</Title>
        <Text c="dimmed">
          <Trans>Page not found.</Trans>
        </Text>
        <Button component={Link} to="/">
          <Trans>Go home</Trans>
        </Button>
      </Stack>
    </Container>
  );
}
