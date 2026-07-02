import { Paper, Text, Title, Button, List, ThemeIcon, Stack, Group, Badge } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import type { Plan, PlanEntitlement as PlanEntitlementType } from "@/shared/api";
import { BILLING_FEATURES } from "@/app/config";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface PlanCardProps {
  plan: Plan;
  isCurrent?: boolean;
  onSelect?: (plan: Plan) => void;
  loading?: boolean;
}

function getDisplayFeatures(planEntitlement: PlanEntitlementType): string[] {
  const display: string[] = [];
  display.push(`Max users: ${planEntitlement.maxUsers === 0 ? "Unlimited" : planEntitlement.maxUsers}`);
  display.push(`Max projects: ${planEntitlement.maxProjects === 0 ? "Unlimited" : planEntitlement.maxProjects}`);
  const prioritySupport = planEntitlement.features[BILLING_FEATURES.PRIORITY_SUPPORT];
  if (prioritySupport && prioritySupport.value.toLowerCase() === "true") {
    display.push("Priority support");
  }
  const advancedAnalytics = planEntitlement.features[BILLING_FEATURES.ADVANCED_ANALYTICS];
  if (advancedAnalytics && advancedAnalytics.value.toLowerCase() === "true") {
    display.push("Advanced analytics");
  }
  return display;
}

export function PlanCard({ plan, isCurrent, onSelect, loading }: PlanCardProps) {
  const planEntitlement = plan.entitlement
    ? (JSON.parse(plan.entitlement) as PlanEntitlementType)
    : { maxUsers: 1, maxProjects: 1, features: {}, pricingModel: null };

  const displayFeatures = getDisplayFeatures(planEntitlement);

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
            <Stack gap="xs">
              <Title order={3}>{plan.displayName}</Title>
              {plan.description && (
                <Text size="sm" c="dimmed">
                  {plan.description}
                </Text>
              )}
              {(() => {
                const trialDays = Number(plan.trialPeriodDays);
                return !isNaN(trialDays) && trialDays > 0 ? (
                  <Badge variant="light" color="teal">
                    <Trans>{trialDays} Days Free Trial</Trans>
                  </Badge>
                ) : null;
              })()}
            </Stack>
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
              {plan.pricingModel === "PER_SEAT" ? (
                <Trans>/ seat / {plan.billingPeriod.toLowerCase()}</Trans>
              ) : (
                <Trans>/ {plan.billingPeriod.toLowerCase()}</Trans>
              )}
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
