import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Button } from "@mantine/core";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title>Welcome</Title>
        <Text c="dimmed">Your app starts here.</Text>
        <Button component={Link} to="/loading-demo" variant="light">
          View Loading Demo
        </Button>
      </Stack>
    </Container>
  );
}
