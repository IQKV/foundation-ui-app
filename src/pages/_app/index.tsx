import { createFileRoute } from "@tanstack/react-router";
import { Container, SimpleGrid, Skeleton, Stack, Text } from "@mantine/core";
import { IconUsers, IconUserCheck, IconUserX } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";

import { PageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import { iamApi } from "@/shared/api";
import { useSession } from "@/processes/session";
import { FeatureGate, useEntitlementsContext } from "@/features/manage-billing";
import { BILLING_FEATURES, isMultiTenantMode } from "@/app/config";
import { DashboardStatCard, DashboardSignupChart, DashboardPersonalWelcome } from "@/widgets";

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { t } = useLingui();
  const { tenantKey, payload, isPersonalWorkspace, isTenantOwner } = useSession();
  const { hasFeature } = useEntitlementsContext();
  const firstName = payload?.first_name ?? "";
  const lastName = payload?.last_name ?? "";
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
  // Uses the same query key root as DashboardSignupChart so TanStack Query deduplicates
  // requests when both run with the same granularity.
  const { data: statsSnapshot, isLoading: statsLoading } = useQuery({
    queryKey: ["tenant", tenantKey, "stats", "snapshot"],
    queryFn: () =>
      iamApi.getTenantUserStats(tenantKey!, {
        // One-day window on today: we only need the counts, not the series.
        // The chart widget issues its own query with the proper date range.
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
      <PageTitle segments={[t`Dashboard`]} />

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
        <DashboardPersonalWelcome firstName={firstName} lastName={lastName} email={email} />
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
              <DashboardStatCard
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
                  <DashboardStatCard
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
                  <DashboardStatCard
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
              <DashboardSignupChart
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
