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
import { IconUser, IconAlertCircle, IconInfoCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { dayjs } from "@/shared/lib/date-utils";
import { getSubscriptionStatusColor } from "@/shared/lib/color-utils";
import { useEntitlements } from "../model/use-entitlements";
import { useEntitlementsContext } from "../model/entitlements-context";
import { useSession } from "@/processes/session/use-session";
import { isMultiTenantMode } from "@/app/config";
import { PlanEntitlement } from "./plan-entitlement";
import { TestSelectors } from "@/shared/lib/test-selectors";

export function EntitlementsCard() {
  const { data: entitlements, isLoading, isError, error } = useEntitlements();
  const { isPersonalWorkspace } = useSession();
  const { hasFeature, getQuota } = useEntitlementsContext();

  if (isMultiTenantMode && isPersonalWorkspace) {
    // Personal workspace always has entitlements
    const features = {
      maxUsers: getQuota("maxUsers"),
      maxProjects: getQuota("maxProjects"),
      features: {},
    };

    return (
      <Paper withBorder p="xl" radius="md" data-testid={TestSelectors.ENTITLEMENTS_CARD}>
        <Stack gap="lg">
          {/* Header */}
          <Group align="flex-start" wrap="nowrap" gap="lg">
            <ThemeIcon size={48} radius="md" variant="light" color="green">
              <IconUser size={28} />
            </ThemeIcon>

            <Stack gap="xs" style={{ flex: 1 }}>
              <Group justify="space-between">
                <Title order={3}>
                  <Trans>Personal Workspace</Trans>
                </Title>
                <Badge
                  color="green"
                  variant="light"
                  data-testid={TestSelectors.ENTITLEMENTS_STATUS_BADGE}
                >
                  <Trans>ACTIVE</Trans>
                </Badge>
              </Group>

              <Group gap="xl">
                <Stack gap={0}>
                  <Text size="sm" c="dimmed">
                    <Trans>Plan</Trans>
                  </Text>
                  <Text fw={500} data-testid={TestSelectors.ENTITLEMENTS_PLAN_CODE}>
                    Personal
                  </Text>
                </Stack>
              </Group>
            </Stack>
          </Group>

          <Divider />

          {/* Features */}
          <PlanEntitlement features={features} showTitle={false} />
        </Stack>
      </Paper>
    );
  }

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

  const statusColor = getSubscriptionStatusColor(entitlements.status);
  const isEntitlementsActive = entitlements.status === "active";

  return (
    <Paper withBorder p="xl" radius="md" data-testid={TestSelectors.ENTITLEMENTS_CARD}>
      <Stack gap="lg">
        {/* Header */}
        <Group align="flex-start" wrap="nowrap" gap="lg">
          <ThemeIcon size={48} radius="md" variant="light" color="violet">
            <IconUser size={28} />
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

              {isEntitlementsActive && (
                <Stack gap={0}>
                  <Text size="sm" c="dimmed">
                    <Trans>Renews On</Trans>
                  </Text>
                  <Group gap="xs">
                    <IconUser size={14} />
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
        <PlanEntitlement features={entitlements.features} showTitle={false} />
      </Stack>
    </Paper>
  );
}
