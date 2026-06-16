import { Paper, Text, Title, Button, List, ThemeIcon, Stack, Group, Badge } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import type { Plan, PlanFeatures as PlanFeaturesType } from "@/shared/api";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface PlanCardProps {
  plan: Plan;
  isCurrent?: boolean;
  onSelect?: (plan: Plan) => void;
  loading?: boolean;
}

function getDisplayFeatures(features: PlanFeaturesType): string[] {
  const display: string[] = [];
  display.push(`Max users: ${features.maxUsers === 0 ? "Unlimited" : features.maxUsers}`);
  display.push(`Max projects: ${features.maxProjects === 0 ? "Unlimited" : features.maxProjects}`);
  if (features.prioritySupport) {
    display.push("Priority support");
  }
  return display;
}

export function PlanCard({ plan, isCurrent, onSelect, loading }: PlanCardProps) {
  const features = plan.featureSet
    ? (JSON.parse(plan.featureSet) as PlanFeaturesType)
    : { prioritySupport: false, maxUsers: 1, maxProjects: 1 };

  const displayFeatures = getDisplayFeatures(features);

  return (
    <Paper
      withBorder
      p="xl"
      radius="md"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
      data-testid={TestSelectors.PLAN_CARD(plan.planCode)}
    >
      <Stack justify="space-between" style={{ flex: 1 }}>
        <Stack gap="xs">
          <Group justify="space-between" align="flex-start">
            <Title order={3}>{plan.displayName}</Title>
            {isCurrent && (
              <Badge
                variant="filled"
                color="blue"
                data-testid={TestSelectors.PLAN_CARD_CURRENT_BADGE(plan.planCode)}
              >
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
            {displayFeatures.map((feature, index) => (
              <List.Item
                key={index}
                data-testid={TestSelectors.PLAN_CARD_FEATURE(plan.planCode, index)}
              >
                {feature}
              </List.Item>
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
          data-testid={TestSelectors.PLAN_CARD_BUTTON(plan.planCode)}
        >
          {isCurrent ? <Trans>Active</Trans> : <Trans>Select Plan</Trans>}
        </Button>
      </Stack>
    </Paper>
  );
}
