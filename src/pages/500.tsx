import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";

export const Route = createFileRoute("/500")({
  component: InternalServerErrorPage,
});

function InternalServerErrorPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title>500</Title>
        <Text c="dimmed">Internal server error.</Text>
        <Button component={Link} to="/">
          Go home
        </Button>
      </Stack>
    </Container>
  );
}
