import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Skeleton,
  Stack,
  Title,
  List,
  Badge,
  Avatar,
  Paper,
  Divider,
  SegmentedControl,
  Box,
} from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import {
  IconUsers,
  IconUser,
  IconBuilding,
  IconSettings,
  IconBell,
  IconArrowRight,
  IconUserCheck,
  IconUserX,
  IconChartLine,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { pageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import { iamApi } from "@/shared/api";
import type { TenantUserStatsParams } from "@/shared/api/iam";
import { useSession } from "@/processes/session";
import { FeatureGate, useEntitlementsContext } from "@/features/manage-billing";
import { BILLING_FEATURES, isMultiTenantMode } from "@/app/config";

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

// ─── Signup trend chart card (TENANT_OWNER only) ──────────────────────────────

interface SignupChartCardProps {
  tenantKey: string;
  activeMembers: number | undefined;
  lockedMembers: number | undefined;
  suspendedMembers: number | undefined;
  statsLoading: boolean;
}

function SignupChartCard({
  tenantKey,
  activeMembers,
  lockedMembers,
  suspendedMembers,
  statsLoading,
}: SignupChartCardProps) {
  const { t } = useLingui();
  const [granularity, setGranularity] = useState<"day" | "month">("day");

  // Derive the `from` date from the selected granularity:
  //   day   → last 30 days
  //   month → last 12 months
  const from = (() => {
    const d = new Date();
    if (granularity === "month") {
      d.setMonth(d.getMonth() - 11);
      d.setDate(1);
    } else {
      d.setDate(d.getDate() - 29);
    }
    return d.toISOString().slice(0, 10);
  })();

  const params: TenantUserStatsParams = { from, granularity };

  const {
    data,
    isLoading: seriesLoading,
    isError,
  } = useQuery({
    queryKey: ["tenant", tenantKey, "stats", granularity],
    queryFn: () => iamApi.getTenantUserStats(tenantKey, params),
    staleTime: 5 * 60 * 1000, // 5 min
    retry: false,
  });

  const isLoading = statsLoading || seriesLoading;

  return (
    <Paper withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md" wrap="nowrap">
        <Group gap="sm">
          <ThemeIcon size="lg" radius="md" variant="light" color="violet">
            <IconChartLine size={18} />
          </ThemeIcon>
          <Box>
            <Text fw={600} size="sm">
              <Trans>Member Signups</Trans>
            </Text>
            <Text size="xs" c="dimmed">
              {isLoading ? (
                <Skeleton height={12} width={120} radius="sm" display="inline-block" />
              ) : data ? (
                <Trans>
                  {data.periodFrom} – {data.periodTo}
                </Trans>
              ) : null}
            </Text>
          </Box>
        </Group>

        <SegmentedControl
          size="xs"
          value={granularity}
          onChange={(v) => setGranularity(v as "day" | "month")}
          data={[
            { label: t`Daily`, value: "day" },
            { label: t`Monthly`, value: "month" },
          ]}
        />
      </Group>

      {isError ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">
          <Trans>Unable to load signup data.</Trans>
        </Text>
      ) : isLoading ? (
        <Skeleton height={220} radius="sm" />
      ) : (
        <AreaChart
          h={220}
          data={data!.signupSeries}
          dataKey="period"
          series={[{ name: "signups", color: "violet.6", label: t`New signups` }]}
          curveType="monotone"
          withTooltip
          withXAxis
          withYAxis
          yAxisProps={{ allowDecimals: false }}
          tooltipAnimationDuration={150}
          gridAxis="y"
        />
      )}

      {/* Summary row below chart */}
      <Group gap="xl" mt="md" justify="center">
        <Box ta="center">
          <Text size="xs" c="dimmed">
            <Trans>Active</Trans>
          </Text>
          {statsLoading ? (
            <Skeleton height={18} width={32} radius="sm" mx="auto" mt={2} />
          ) : (
            <Text size="sm" fw={600} c="green">
              {activeMembers?.toLocaleString() ?? "—"}
            </Text>
          )}
        </Box>
        <Box ta="center">
          <Text size="xs" c="dimmed">
            <Trans>Locked</Trans>
          </Text>
          {statsLoading ? (
            <Skeleton height={18} width={32} radius="sm" mx="auto" mt={2} />
          ) : (
            <Text size="sm" fw={600} c="orange">
              {lockedMembers?.toLocaleString() ?? "—"}
            </Text>
          )}
        </Box>
        <Box ta="center">
          <Text size="xs" c="dimmed">
            <Trans>Suspended</Trans>
          </Text>
          {statsLoading ? (
            <Skeleton height={18} width={32} radius="sm" mx="auto" mt={2} />
          ) : (
            <Text size="sm" fw={600} c="red">
              {suspendedMembers?.toLocaleString() ?? "—"}
            </Text>
          )}
        </Box>
        <Box ta="center">
          <Text size="xs" c="dimmed">
            <Trans>Email verified</Trans>
          </Text>
          {isLoading ? (
            <Skeleton height={18} width={32} radius="sm" mx="auto" mt={2} />
          ) : (
            <Text size="sm" fw={600} c="blue">
              {data?.emailVerifiedCount?.toLocaleString() ?? "—"}
            </Text>
          )}
        </Box>
      </Group>
    </Paper>
  );
}

// ─── Personal workspace welcome ───────────────────────────────────────────────

interface PersonalWelcomeProps {
  firstName: string;
  lastName: string;
  email: string;
}

function PersonalWelcome({ firstName, lastName, email }: PersonalWelcomeProps) {
  const initials =
    [firstName, lastName]
      .map((s) => s?.trim().charAt(0) ?? "")
      .join("")
      .toUpperCase() || "?";

  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="lg">
        {/* User identity */}
        <Group gap="md" align="flex-start">
          <Avatar size={56} radius="xl" color="blue" variant="filled">
            {initials}
          </Avatar>
          <Stack gap={2}>
            <Title order={3} fw={700}>
              <Trans>Welcome, {firstName}!</Trans>
            </Title>
            <Text size="sm" c="dimmed">
              {email}
            </Text>
            <Badge variant="light" color="green" size="sm" mt={4} radius="sm">
              <Trans>Personal Workspace</Trans>
            </Badge>
          </Stack>
        </Group>

        <Divider />

        {/* Getting started instructions */}
        <Stack gap="xs">
          <Text fw={600} size="sm">
            <Trans>Here's what you can do from your personal workspace:</Trans>
          </Text>

          <List spacing="sm" size="sm" center>
            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="blue">
                  <IconBuilding size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/create-organization" size="sm" c="blue.6" fw={500}>
                    Create an organization
                  </Text>{" "}
                  to collaborate with your team.
                </Trans>
              </Text>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="violet">
                  <IconUser size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/settings/general" size="sm" c="blue.6" fw={500}>
                    Update your profile
                  </Text>{" "}
                  with your name and avatar.
                </Trans>
              </Text>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="teal">
                  <IconSettings size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/settings/security" size="sm" c="blue.6" fw={500}>
                    Secure your account
                  </Text>{" "}
                  by changing your password.
                </Trans>
              </Text>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="orange">
                  <IconBell size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/settings/notifications" size="sm" c="blue.6" fw={500}>
                    Configure notifications
                  </Text>{" "}
                  to stay informed.
                </Trans>
              </Text>
            </List.Item>
          </List>
        </Stack>

        <Group gap="xs" c="dimmed">
          <IconArrowRight size={14} />
          <Text size="xs">
            <Trans>
              Switch between workspaces anytime using the workspace switcher in the sidebar.
            </Trans>
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { t } = useLingui();
  const { tenantKey, payload, isPersonalWorkspace, isTenantOwner } = useSession();
  const { hasFeature } = useEntitlementsContext();
  const firstName = payload?.firstName ?? "";
  const lastName = payload?.lastName ?? "";
  const email = payload?.email ?? "";

  // Fetch tenant details — all members should be able to see this.
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ["tenant", tenantKey],
    queryFn: () => iamApi.getTenant(tenantKey!),
    enabled: !!tenantKey,
    retry: false,
  });

  // Fetch member count — not relevant for personal workspaces or single-tenant mode.
  const { data: membersPage, isLoading: membersLoading } = useQuery({
    queryKey: ["tenant", tenantKey, "members"],
    queryFn: () => iamApi.listMembers(tenantKey!, { size: 1 }),
    enabled: !!tenantKey && !isPersonalWorkspace && isMultiTenantMode,
    retry: false,
  });

  // Fetch aggregate stats snapshot (counts only, no series) — TENANT_OWNER only, requires advanced_analytics.
  // Uses the same query key root as SignupChartCard so TanStack Query deduplicates
  // requests when both run with the same granularity.
  const { data: statsSnapshot, isLoading: statsLoading } = useQuery({
    queryKey: ["tenant", tenantKey, "stats", "snapshot"],
    queryFn: () =>
      iamApi.getTenantUserStats(tenantKey!, {
        // One-day window on today: we only need the counts, not the series.
        // The chart card issues its own query with the proper date range.
        from: new Date().toISOString().slice(0, 10),
        granularity: "day",
      }),
    enabled:
      !!tenantKey &&
      isTenantOwner &&
      !isPersonalWorkspace &&
      isMultiTenantMode &&
      hasFeature(BILLING_FEATURES.ADVANCED_ANALYTICS),
    staleTime: 5 * 60 * 1000,
    retry: false,
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

      {isMultiTenantMode && isPersonalWorkspace ? (
        /* Multi-tenant personal workspace — getting-started guide with org CTAs */
        <PersonalWelcome firstName={firstName} lastName={lastName} email={email} />
      ) : (
        <Stack gap="md">
          {/* Greeting */}
          {firstName && (
            <Text c="dimmed" size="sm">
              <Trans>Welcome back, {firstName}.</Trans>
            </Text>
          )}

          {/* Stat cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: isTenantOwner ? 3 : 1 }} spacing="md">
            {isMultiTenantMode && (
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
            )}

            {/* Additional stat cards visible to TENANT_OWNER, requires advanced_analytics feature */}
            {isMultiTenantMode && isTenantOwner && tenantKey && (
              <FeatureGate feature={BILLING_FEATURES.ADVANCED_ANALYTICS}>
                <>
                  <StatCard
                    icon={<IconUserCheck size={20} />}
                    color="green"
                    value={
                      statsLoading ? (
                        <Skeleton height={28} width={48} radius="sm" />
                      ) : (
                        (statsSnapshot?.activeMembers.toLocaleString() ?? "—")
                      )
                    }
                    label={<Trans>Active members</Trans>}
                  />
                  <StatCard
                    icon={<IconUserX size={20} />}
                    color="orange"
                    value={
                      statsLoading ? (
                        <Skeleton height={28} width={48} radius="sm" />
                      ) : statsSnapshot != null ? (
                        (
                          statsSnapshot.lockedMembers + statsSnapshot.suspendedMembers
                        ).toLocaleString()
                      ) : (
                        "—"
                      )
                    }
                    label={<Trans>Locked / Suspended</Trans>}
                  />
                </>
              </FeatureGate>
            )}
          </SimpleGrid>

          {/* Signup trend chart — TENANT_OWNER only, requires advanced_analytics feature */}
          {isMultiTenantMode && isTenantOwner && tenantKey && (
            <FeatureGate feature={BILLING_FEATURES.ADVANCED_ANALYTICS} showUpgradePrompt>
              <SignupChartCard
                tenantKey={tenantKey}
                activeMembers={statsSnapshot?.activeMembers}
                lockedMembers={statsSnapshot?.lockedMembers}
                suspendedMembers={statsSnapshot?.suspendedMembers}
                statsLoading={statsLoading}
              />
            </FeatureGate>
          )}
        </Stack>
      )}
    </Container>
  );
}
