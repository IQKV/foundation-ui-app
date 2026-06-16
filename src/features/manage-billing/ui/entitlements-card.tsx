import {
  Paper,
  Group,
  Stack,
  Title,
  Text,
  ThemeIcon,
  Badge,
  Skeleton,
  Alert,
  Divider,
} from "@mantine/core";
import { IconCrown, IconAlertCircle, IconCalendar, IconInfoCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";
import { useEntitlements } from "../model/use-entitlements";
import { PlanFeatures } from "./plan-features";
import { TestSelectors } from "@/shared/lib/test-selectors";

export function EntitlementsCard() {
  const { data: entitlements, isLoading, isError, error } = useEntitlements();

  if (isLoading) {
    return <Skeleton height={200} radius="md" data-testid={TestSelectors.ENTITLEMENTS_LOADING} />;
  }

  if (isError) {
    // Handle 404 specifically - no active subscription
    if (error && (error as any)?.response?.status === 404) {
      return (
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          data-testid={TestSelectors.ENTITLEMENTS_NO_SUBSCRIPTION}
        >
          <Trans>
            No active subscription found. Subscribe to a plan to access platform features.
          </Trans>
        </Alert>
      );
    }

    // Other errors
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        color="red"
        variant="light"
        data-testid={TestSelectors.ENTITLEMENTS_ERROR}
      >
        <Trans>Unable to load subscription information. Please try again later.</Trans>
      </Alert>
    );
  }

  if (!entitlements) {
    return null;
  }

  const statusColor = entitlements.status === "active" ? "green" : "orange";
  const isActive = entitlements.status === "active";

  return (
    <Paper withBorder p="xl" radius="md" data-testid={TestSelectors.ENTITLEMENTS_CARD}>
      <Stack gap="lg">
        {/* Header */}
        <Group align="flex-start" wrap="nowrap" gap="lg">
          <ThemeIcon size={48} radius="md" variant="light" color="violet">
            <IconCrown size={28} />
          </ThemeIcon>

          <Stack gap="xs" style={{ flex: 1 }}>
            <Group justify="space-between">
              <Title order={3}>
                <Trans>Current Plan</Trans>
              </Title>
              <Badge
                color={statusColor}
                variant="light"
                data-testid={TestSelectors.ENTITLEMENTS_STATUS_BADGE}
              >
                {entitlements.status.toUpperCase()}
              </Badge>
            </Group>

            <Group gap="xl">
              <Stack gap={0}>
                <Text size="sm" c="dimmed">
                  <Trans>Plan</Trans>
                </Text>
                <Text fw={500} data-testid={TestSelectors.ENTITLEMENTS_PLAN_CODE}>
                  {entitlements.planCode}
                </Text>
              </Stack>

              {isActive && (
                <Stack gap={0}>
                  <Text size="sm" c="dimmed">
                    <Trans>Renews On</Trans>
                  </Text>
                  <Group gap="xs">
                    <IconCalendar size={14} />
                    <Text fw={500} data-testid={TestSelectors.ENTITLEMENTS_PERIOD_END}>
                      {dayjs(entitlements.currentPeriodEnd).format("MMMM D, YYYY")}
                    </Text>
                  </Group>
                </Stack>
              )}
            </Group>
          </Stack>
        </Group>

        <Divider />

        {/* Features */}
        <PlanFeatures features={entitlements.features} showTitle={false} />
      </Stack>
    </Paper>
  );
}
