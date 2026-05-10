import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { Trans } from "@lingui/react/macro";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <Container size="sm" py="xl">
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
