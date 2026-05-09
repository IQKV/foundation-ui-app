import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title>404</Title>
        <Text c="dimmed">Page not found.</Text>
        <Button component={Link} to="/">
          Go home
        </Button>
      </Stack>
    </Container>
  );
}
