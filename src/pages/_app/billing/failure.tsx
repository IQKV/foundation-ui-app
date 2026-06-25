import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Container, Stack, Text, Paper, Button, Group, ThemeIcon, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";

export const Route = createFileRoute("/_app/billing/failure")({
  component: BillingFailurePage,
});

function BillingFailurePage() {
  const { t } = useLingui();
  const navigate = useNavigate();

  return (
    <Container size="md" py="xl">
      <Helmet title={pageTitle(t`Payment Failed`)} />
      <Stack align="center" justify="center" py="xl">
        <Paper withBorder p="xl" radius="md" style={{ width: "100%" }}>
          <Stack align="center" gap="lg">
            <ThemeIcon size={80} radius="xl" color="red" variant="light">
              <IconAlertCircle size={40} />
            </ThemeIcon>

            <Stack gap="xs" align="center">
              <Title order={2}>
                <Trans>Payment Failed</Trans>
              </Title>
              <Text size="lg" c="dimmed" ta="center">
                <Trans>
                  Something went wrong with your payment. Please try again or contact support.
                </Trans>
              </Text>
            </Stack>

            <Group mt="xl">
              <Button variant="filled" color="blue" onClick={() => navigate({ to: "/billing" })}>
                <Trans>Try Again</Trans>
              </Button>
              <Button variant="light" color="blue" onClick={() => navigate({ to: "/" })}>
                <Trans>Go to Home</Trans>
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
