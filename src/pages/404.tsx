import { createFileRoute, Link } from "@tanstack/react-router";
import { Container, Title, Text, Button, Stack } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/404")({
  component: NotFoundPage,
});

function NotFoundPage() {
  const { t } = useLingui();
  return (
    <Container size="sm" py="xl" data-testid="page-404">
      <Helmet>
        <title>{pageTitle(t`Page Not Found`)}</title>
      </Helmet>
      <Stack align="center" gap="md">
        <Title>404</Title>
        <Text c="dimmed">
          <Trans>Page not found.</Trans>
        </Text>
        <Button component={Link} to="/" data-testid={TestSelectors.ERROR_PAGE_GO_HOME_BUTTON}>
          <Trans>Go home</Trans>
        </Button>
      </Stack>
    </Container>
  );
}
