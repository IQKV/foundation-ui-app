import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Button, Group, Code } from "@mantine/core";
import { nprogress } from "@mantine/nprogress";
import { useState } from "react";
import { LoadingOverlay } from "@/shared/ui";

export const Route = createFileRoute("/loading-demo")({
  component: LoadingDemoPage,
});

function LoadingDemoPage() {
  const [showOverlay, setShowOverlay] = useState(false);

  const handleProgressDemo = () => {
    nprogress.start();
    setTimeout(() => {
      nprogress.set(30);
    }, 500);
    setTimeout(() => {
      nprogress.set(60);
    }, 1000);
    setTimeout(() => {
      nprogress.complete();
    }, 1500);
  };

  const handleOverlayDemo = () => {
    setShowOverlay(true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 2000);
  };

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            Loading States Demo
          </Title>
          <Text c="dimmed">
            This template uses Mantine's official loading components for optimal UX.
          </Text>
        </div>

        <Stack gap="md">
          <div>
            <Title order={2} size="h3" mb="sm">
              1. Initial Page Load
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              Full-screen centered loader shown on first app load (while locale initializes).
            </Text>
            <Code block>{`<LoadingOverlay visible={isInitialLoading} />`}</Code>
            <Group mt="md">
              <Button onClick={handleOverlayDemo}>Demo LoadingOverlay (2s)</Button>
            </Group>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">
              2. Page Transitions
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              Slim top progress bar for navigation between pages (automatic with router).
            </Text>
            <Code block>
              {`<NavigationProgress />
// Auto-triggered on route changes`}
            </Code>
            <Group mt="md">
              <Button onClick={handleProgressDemo}>Demo Progress Bar</Button>
              <Button variant="light" onClick={() => nprogress.start()}>
                Start
              </Button>
              <Button variant="light" onClick={() => nprogress.complete()}>
                Complete
              </Button>
            </Group>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">
              Implementation Details
            </Title>
            <Stack gap="xs">
              <Text size="sm">
                ✅ Uses <Code>@mantine/nprogress</Code> for top loading bar
              </Text>
              <Text size="sm">
                ✅ Uses <Code>LoadingOverlay</Code> component for full-screen loading
              </Text>
              <Text size="sm">
                ✅ Automatic router integration via <Code>router.subscribe()</Code>
              </Text>
              <Text size="sm">✅ Theme-aware (respects dark mode and color scheme)</Text>
              <Text size="sm">✅ Accessible with proper keyboard handling</Text>
            </Stack>
          </div>
        </Stack>
      </Stack>

      <LoadingOverlay visible={showOverlay} message="Loading demo..." />
    </Container>
  );
}
