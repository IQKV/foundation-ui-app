import { createFileRoute } from "@tanstack/react-router";
import { Container, Title, Text, Stack, Button, Group, Code } from "@mantine/core";
import { nprogress } from "@mantine/nprogress";
import { useState } from "react";
import { Trans } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
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
      <Helmet>
        <title>Loading Demo | IQKV Admin</title>
      </Helmet>
      <Stack gap="xl">
        <div>
          <Title order={1} mb="md">
            <Trans>Loading States Demo</Trans>
          </Title>
          <Text c="dimmed">
            <Trans>This template uses Mantine's official loading components for optimal UX.</Trans>
          </Text>
        </div>

        <Stack gap="md">
          <div>
            <Title order={2} size="h3" mb="sm">
              <Trans>1. Initial Page Load</Trans>
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              <Trans>
                Full-screen centered loader shown on first app load (while locale initializes).
              </Trans>
            </Text>
            <Code block>{`<LoadingOverlay visible={isInitialLoading} />`}</Code>
            <Group mt="md">
              <Button onClick={handleOverlayDemo}>
                <Trans>Demo LoadingOverlay (2s)</Trans>
              </Button>
            </Group>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">
              <Trans>2. Page Transitions</Trans>
            </Title>
            <Text size="sm" c="dimmed" mb="md">
              <Trans>
                Slim top progress bar for navigation between pages (automatic with router).
              </Trans>
            </Text>
            <Code block>
              {`<NavigationProgress />
// Auto-triggered on route changes`}
            </Code>
            <Group mt="md">
              <Button onClick={handleProgressDemo}>
                <Trans>Demo Progress Bar</Trans>
              </Button>
              <Button variant="light" onClick={() => nprogress.start()}>
                <Trans>Start</Trans>
              </Button>
              <Button variant="light" onClick={() => nprogress.complete()}>
                <Trans>Complete</Trans>
              </Button>
            </Group>
          </div>

          <div>
            <Title order={2} size="h3" mb="sm">
              <Trans>Implementation Details</Trans>
            </Title>
            <Stack gap="xs">
              <Text size="sm">
                ✅{" "}
                <Trans>
                  Uses <Code>@mantine/nprogress</Code> for top loading bar
                </Trans>
              </Text>
              <Text size="sm">
                ✅{" "}
                <Trans>
                  Uses <Code>LoadingOverlay</Code> component for full-screen loading
                </Trans>
              </Text>
              <Text size="sm">
                ✅{" "}
                <Trans>
                  Automatic router integration via <Code>router.subscribe()</Code>
                </Trans>
              </Text>
              <Text size="sm">
                ✅ <Trans>Theme-aware (respects dark mode and color scheme)</Trans>
              </Text>
              <Text size="sm">
                ✅ <Trans>Accessible with proper keyboard handling</Trans>
              </Text>
            </Stack>
          </div>
        </Stack>
      </Stack>

      <LoadingOverlay visible={showOverlay} />
    </Container>
  );
}
