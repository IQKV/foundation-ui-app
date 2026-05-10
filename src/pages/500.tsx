import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { Trans } from "@lingui/react/macro";

export const Route = createFileRoute("/500")({
  component: InternalServerErrorPage,
});

function InternalServerErrorPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title>500</Title>
        <Text c="dimmed">
          <Trans>Internal server error.</Trans>
        </Text>
        <Button component={Link} to="/">
          <Trans>Go home</Trans>
        </Button>
      </Stack>
    </Container>
  );
}
