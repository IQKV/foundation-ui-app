import { Paper, Group, Stack, Title, Text, ThemeIcon, Badge, Skeleton, List } from "@mantine/core";
import { IconCreditCard, IconCalendar, IconCheck } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";
import { useActiveSubscription } from "../model/use-subscription";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface CurrentSubscriptionProps {
  tenantKey?: string;
}

export function CurrentSubscription({ tenantKey }: CurrentSubscriptionProps) {
  const { data: subscription, isLoading, isError } = useActiveSubscription(tenantKey ?? null);

  if (isLoading) {
    return (
      <Skeleton height={120} radius="md" data-testid={TestSelectors.CURRENT_SUBSCRIPTION_LOADING} />
    );
  }

  if (isError || !subscription) {
    // Show Free plan when no active subscription
    return (
      <Paper withBorder p="xl" radius="md" data-testid={TestSelectors.CURRENT_SUBSCRIPTION}>
        <Group align="flex-start" wrap="nowrap" gap="lg">
          <ThemeIcon size={48} radius="md" variant="light" color="blue">
            <IconCreditCard size={28} />
          </ThemeIcon>

          <Stack gap="xs" style={{ flex: 1 }}>
            <Group justify="space-between">
              <Title order={3}>
                <Trans>Current Subscription</Trans>
              </Title>
              <Badge
                color="green"
                variant="light"
                data-testid={TestSelectors.CURRENT_SUBSCRIPTION_STATUS_BADGE}
              >
                <Trans>ACTIVE</Trans>
              </Badge>
            </Group>

            <Group gap="xl">
              <Stack gap={0}>
                <Text size="sm" c="dimmed">
                  <Trans>Plan</Trans>
                </Text>
                <Text fw={500} data-testid={TestSelectors.CURRENT_SUBSCRIPTION_PLAN}>
                  <Trans>Free</Trans>
                </Text>
              </Stack>

              <Stack gap={0}>
                <Text size="sm" c="dimmed">
                  <Trans>Features</Trans>
                </Text>
                <List spacing="xs" size="sm" center icon={<IconCheck size={12} />}>
                  <List.Item>
                    <Trans>Limited support</Trans>
                  </List.Item>
                </List>
              </Stack>
            </Group>
          </Stack>
        </Group>
      </Paper>
    );
  }

  const isCanceled = subscription.status === "canceled";
  const statusColor = subscription.status === "active" ? "green" : "orange";

  return (
    <Paper withBorder p="xl" radius="md" data-testid={TestSelectors.CURRENT_SUBSCRIPTION}>
      <Group align="flex-start" wrap="nowrap" gap="lg">
        <ThemeIcon size={48} radius="md" variant="light" color="blue">
          <IconCreditCard size={28} />
        </ThemeIcon>

        <Stack gap="xs" style={{ flex: 1 }}>
          <Group justify="space-between">
            <Title order={3}>
              <Trans>Current Subscription</Trans>
            </Title>
            <Badge
              color={statusColor}
              variant="light"
              data-testid={TestSelectors.CURRENT_SUBSCRIPTION_STATUS_BADGE}
            >
              {subscription.status.toUpperCase()}
            </Badge>
          </Group>

          <Group gap="xl">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                <Trans>Plan</Trans>
              </Text>
              <Text fw={500} data-testid={TestSelectors.CURRENT_SUBSCRIPTION_PLAN}>
                {subscription.planId}
              </Text>
            </Stack>

            {subscription.isInTrial && (
              <Stack gap={0}>
                <Text size="sm" c="dimmed">
                  <Trans>Trial Status</Trans>
                </Text>
                <Badge variant="light" color="teal">
                  {subscription.trialDaysLeft !== null && subscription.trialDaysLeft > 0 ? (
                    <Trans>{subscription.trialDaysLeft} Days Left</Trans>
                  ) : (
                    <Trans>Trial Active</Trans>
                  )}
                </Badge>
              </Stack>
            )}

            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                <Trans>Next Billing Date</Trans>
              </Text>
              <Group gap="xs">
                <IconCalendar size={14} />
                <Text fw={500} data-testid={TestSelectors.CURRENT_SUBSCRIPTION_NEXT_BILLING_DATE}>
                  {dayjs(subscription.currentPeriodEnd).format("MMMM D, YYYY")}
                </Text>
              </Group>
            </Stack>

            {subscription.cancelAtPeriodEnd && (
              <Stack gap={0}>
                <Text size="sm" color="red">
                  <Trans>Cancels on</Trans>
                </Text>
                <Text
                  size="sm"
                  fw={500}
                  color="red"
                  data-testid={TestSelectors.CURRENT_SUBSCRIPTION_CANCEL_INFO}
                >
                  {dayjs(subscription.currentPeriodEnd).format("MMMM D, YYYY")}
                </Text>
              </Stack>
            )}
          </Group>
        </Stack>
      </Group>
    </Paper>
  );
}
