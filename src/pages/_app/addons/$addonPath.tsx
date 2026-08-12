import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { Suspense, useEffect, useState } from "react";
import { Container, Stack, Text, Loader } from "@mantine/core";
import { PageHeader } from "@/shared/ui";
import { PageTitle } from "@/shared/lib/page-title";
import { Trans, useLingui } from "@lingui/react/macro";
import { addonRegistry } from "@/app/addons";

export const Route = createFileRoute("/_app/addons/$addonPath")({
  component: AddonPage,
});

function AddonPage() {
  const { t } = useLingui();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [Component, setComponent] = useState<React.ComponentType<any> | null>(null);

  useEffect(() => {
    const findRoute = async () => {
      const addons = addonRegistry.getAllAddons();
      for (const addon of addons) {
        if (addon.routes) {
          for (const route of addon.routes) {
            if (route.path === currentPath && route.component) {
              const loaded = await route.component();
              setComponent(() => loaded.default);
              return;
            }
          }
        }
      }
    };
    findRoute().catch(console.error);
  }, [currentPath]);

  if (!Component) {
    return (
      <Container size="xl" py="xl">
        <Stack align="center">
          <Loader size="lg" />
          <Text>Loading addon page...</Text>
        </Stack>
      </Container>
    );
  }

  return (
    <Container size="xl" py={0}>
      <PageTitle segments={[t`Addons`]} />
      <PageHeader
        title={<Trans>Addon Page</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans> },
          { label: <Trans>Dashboard</Trans>, to: "/" },
          { label: <Trans>Addons</Trans> },
        ]}
      />
      <Suspense
        fallback={
          <Container size="xl" py="xl">
            <Stack align="center">
              <Loader size="lg" />
              <Text>Loading addon page...</Text>
            </Stack>
          </Container>
        }
      >
        <Component />
      </Suspense>
    </Container>
  );
}
