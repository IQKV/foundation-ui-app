import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Button,
  Skeleton,
  Tooltip,
} from "@mantine/core";
import {
  IconUsers,
  IconBuilding,
  IconCreditCard,
  IconArrowRight,
  IconAlertCircle,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { PageHeader } from "@/shared/ui";
import { useDashboardCounts } from "@/shared/api";
import type { DashboardCountResult } from "@/shared/api";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

// ─── Stat display ─────────────────────────────────────────────────────────────

function StatValue({ count }: { count: DashboardCountResult }) {
  if (count.isLoading) {
    return <Skeleton height={28} width={60} radius="sm" mb={4} />;
  }
  if (count.isError) {
    return (
      <Tooltip label={<Trans>Failed to load</Trans>} withArrow>
        <Text size="xl" fw={700} c="red" mb={4} style={{ cursor: "default" }}>
          <IconAlertCircle size={20} style={{ verticalAlign: "middle" }} />
        </Text>
      </Tooltip>
    );
  }
  return (
    <Text size="xl" fw={700} mb={4}>
      {count.value?.toLocaleString() ?? "—"}
    </Text>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AdminDashboardPage() {
  const { t } = useLingui();
  const counts = useDashboardCounts();

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{t`Dashboard | IQKV Admin`}</title>
      </Helmet>
      <PageHeader
        title={<Trans>Dashboard</Trans>}
        breadcrumbs={[{ label: <Trans>Home</Trans> }, { label: <Trans>Dashboard</Trans> }]}
      />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconUsers size={20} />
            </ThemeIcon>
          </Group>
          <StatValue count={counts.users} />
          <Text size="sm" c="dimmed">
            <Trans>Total Users</Trans>
          </Text>
          <Button
            component={Link}
            to="/admin/users"
            variant="subtle"
            size="xs"
            mt="md"
            px={0}
            rightSection={<IconArrowRight size={14} />}
          >
            <Trans>Manage users</Trans>
          </Button>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
              <IconBuilding size={20} />
            </ThemeIcon>
          </Group>
          <StatValue count={counts.tenants} />
          <Text size="sm" c="dimmed">
            <Trans>Organizations</Trans>
          </Text>
          <Button
            component={Link}
            to="/admin/organizations"
            variant="subtle"
            size="xs"
            mt="md"
            px={0}
            rightSection={<IconArrowRight size={14} />}
          >
            <Trans>Manage organizations</Trans>
          </Button>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="teal">
              <IconCreditCard size={20} />
            </ThemeIcon>
          </Group>
          <StatValue count={counts.subscriptions} />
          <Text size="sm" c="dimmed">
            <Trans>Active Subscriptions</Trans>
          </Text>
          <Button
            component={Link}
            to="/admin/subscriptions"
            variant="subtle"
            size="xs"
            mt="md"
            px={0}
            rightSection={<IconArrowRight size={14} />}
          >
            <Trans>Manage subscriptions</Trans>
          </Button>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
