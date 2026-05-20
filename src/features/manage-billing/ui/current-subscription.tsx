import { Paper, Group, Stack, Title, Text, ThemeIcon, Badge, Skeleton, Alert } from "@mantine/core";
import { IconCreditCard, IconAlertCircle, IconCalendar } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";
import { useActiveSubscription } from "../model/use-subscription";

interface CurrentSubscriptionProps {
  tenantKey: string;
}

export function CurrentSubscription({ tenantKey }: CurrentSubscriptionProps) {
  const { data: subscription, isLoading, isError } = useActiveSubscription(tenantKey);

  if (isLoading) {
    return <Skeleton height={120} radius="md" />;
  }

  if (isError || !subscription) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="blue" variant="light">
        <Trans>
          You don't have an active subscription yet. Choose a plan below to get started.
        </Trans>
      </Alert>
    );
  }

  const isCanceled = subscription.status === "canceled";
  const statusColor = subscription.status === "active" ? "green" : "orange";

  return (
    <Paper withBorder p="xl" radius="md">
      <Group align="flex-start" wrap="nowrap" gap="lg">
        <ThemeIcon size={48} radius="md" variant="light" color="blue">
          <IconCreditCard size={28} />
        </ThemeIcon>

        <Stack gap="xs" style={{ flex: 1 }}>
          <Group justify="space-between">
            <Title order={3}>
              <Trans>Current Subscription</Trans>
            </Title>
            <Badge color={statusColor} variant="light">
              {subscription.status.toUpperCase()}
            </Badge>
          </Group>

          <Group gap="xl">
            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                <Trans>Plan</Trans>
              </Text>
              <Text fw={500}>{subscription.planId}</Text>
            </Stack>

            <Stack gap={0}>
              <Text size="sm" c="dimmed">
                <Trans>Next Billing Date</Trans>
              </Text>
              <Group gap="xs">
                <IconCalendar size={14} />
                <Text fw={500}>{dayjs(subscription.currentPeriodEnd).format("MMMM D, YYYY")}</Text>
              </Group>
            </Stack>

            {subscription.cancelAtPeriodEnd && (
              <Stack gap={0}>
                <Text size="sm" color="red">
                  <Trans>Cancels on</Trans>
                </Text>
                <Text size="sm" fw={500} color="red">
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
