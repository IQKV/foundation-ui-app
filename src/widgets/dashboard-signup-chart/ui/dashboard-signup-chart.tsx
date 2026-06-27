import { useState } from "react";
import { Paper, Group, ThemeIcon, Text, Box, Skeleton, SegmentedControl } from "@mantine/core";
import { AreaChart } from "@mantine/charts";
import { IconChartLine } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useQuery } from "@tanstack/react-query";

import { iamApi } from "@/shared/api";
import type { TenantUserStatsParams } from "@/shared/api/iam";

export interface DashboardSignupChartProps {
  tenantKey: string;
  activeMembers: number | undefined;
  lockedMembers: number | undefined;
  suspendedMembers: number | undefined;
  statsLoading: boolean;
}

export function DashboardSignupChart({
  tenantKey,
  activeMembers,
  lockedMembers,
  suspendedMembers,
  statsLoading,
}: DashboardSignupChartProps) {
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
    staleTime: 5 * 60 * 1000,
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
