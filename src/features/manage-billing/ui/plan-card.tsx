import { Paper, Text, Title, Button, List, ThemeIcon, Stack, Group, Badge } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import type { Plan } from "@/shared/api";

interface PlanCardProps {
  plan: Plan;
  isCurrent?: boolean;
  onSelect?: (plan: Plan) => void;
  loading?: boolean;
}

export function PlanCard({ plan, isCurrent, onSelect, loading }: PlanCardProps) {
  const features = (plan.featureSet ? JSON.parse(plan.featureSet) : []) as string[];

  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Stack justify="space-between" style={{ flex: 1 }}>
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Title order={3}>{plan.displayName}</Title>
            {isCurrent && (
              <Badge variant="filled" color="blue">
                <Trans>Current Plan</Trans>
              </Badge>
            )}
          </Group>

          <Group align="flex-end" gap={4}>
            <Text size="xl" fw={700}>
              ${(plan.priceMinor / 100).toFixed(2)}
            </Text>
            <Text size="sm" c="dimmed" mb={4}>
              / {plan.billingPeriod.toLowerCase()}
            </Text>
          </Group>

          <List
            spacing="xs"
            size="sm"
            center
            icon={
              <ThemeIcon color="teal" size={20} radius="xl">
                <IconCheck size={12} />
              </ThemeIcon>
            }
          >
            {features.map((feature: string, index: number) => (
              <List.Item key={index}>{feature}</List.Item>
            ))}
          </List>
        </Stack>

        <Button
          fullWidth
          mt="xl"
          variant={isCurrent ? "light" : "filled"}
          disabled={isCurrent}
          onClick={() => onSelect?.(plan)}
          loading={loading}
        >
          {isCurrent ? <Trans>Active</Trans> : <Trans>Select Plan</Trans>}
        </Button>
      </Stack>
    </Paper>
  );
}
