import { createFileRoute } from "@tanstack/react-router";
import { Container, Text, SimpleGrid, Card, Group, ThemeIcon, Skeleton } from "@mantine/core";
import { IconUsers } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery } from "@tanstack/react-query";
import { pageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import { iamApi } from "@/shared/api";
import { useSessionStore } from "@/processes/session";
import { decodeJwt } from "@/shared/lib/jwt";

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
});

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  color: string;
  value: React.ReactNode;
  label: React.ReactNode;
}

function StatCard({ icon, color, value, label }: StatCardProps) {
  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <ThemeIcon size="lg" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
      <Text size="xl" fw={700} mb={4}>
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { t } = useLingui();

  // Derive tenant key and user name from the in-memory access token.
  const accessToken = useSessionStore((s) => s.accessToken);
  const tenantKey = useSessionStore((s) => s.tenantKey);
  const payload = accessToken ? decodeJwt(accessToken) : null;
  const firstName = payload?.firstName ?? "";

  // Fetch tenant details and member count in parallel.
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ["tenant", tenantKey],
    queryFn: () => iamApi.getTenant(tenantKey!),
    enabled: !!tenantKey,
  });

  const { data: membersPage, isLoading: membersLoading } = useQuery({
    queryKey: ["tenant", tenantKey, "members"],
    queryFn: () => iamApi.listMembers(tenantKey!, { size: 1 }),
    enabled: !!tenantKey,
  });

  const memberCount = membersPage?.totalElements;

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Dashboard`)}</title>
      </Helmet>

      <PageHeader
        title={
          tenantLoading ? (
            <Skeleton height={24} width={180} radius="sm" />
          ) : (
            <Trans>{tenant?.name ?? t`Dashboard`}</Trans>
          )
        }
        breadcrumbs={[{ label: <Trans>Home</Trans> }, { label: <Trans>Dashboard</Trans> }]}
      />

      {/* Greeting */}
      {firstName && (
        <Text c="dimmed" size="sm" mb="lg">
          <Trans>Welcome back, {firstName}.</Trans>
        </Text>
      )}

      {/* Stat cards */}
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        {/* Team */}
        <StatCard
          icon={<IconUsers size={20} />}
          color="blue"
          value={
            membersLoading ? (
              <Skeleton height={28} width={48} radius="sm" />
            ) : (
              (memberCount?.toLocaleString() ?? "—")
            )
          }
          label={<Trans>Team members</Trans>}
        />
      </SimpleGrid>
    </Container>
  );
}
