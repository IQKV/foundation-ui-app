import { SimpleGrid, Skeleton, Text, Alert, SegmentedControl, Stack } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useState } from "react";
import { usePlans } from "../model/use-plans";
import { PlanCard } from "./plan-card";
import type { Plan } from "@/shared/api";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface PlanListProps {
  currentPlanId?: string;
  onSelect?: (plan: Plan) => void;
  selectingPlanId?: string;
}

export function PlanList({ currentPlanId, onSelect, selectingPlanId }: PlanListProps) {
  const { data: plans, isLoading, isError } = usePlans();
  const [billingPeriod, setBillingPeriod] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");

  if (isLoading) {
    return (
      <Stack gap="xl" align="center">
        <SegmentedControl
          value={billingPeriod}
          onChange={(value) => setBillingPeriod(value as "MONTHLY" | "ANNUAL")}
          data={[
            { label: <Trans>Monthly</Trans>, value: "MONTHLY" },
            { label: <Trans>Yearly</Trans>, value: "ANNUAL" },
          ]}
        />
        <SimpleGrid
          cols={{ base: 1, sm: 2, lg: 3 }}
          spacing="lg"
          data-testid={TestSelectors.PLAN_LIST_LOADING}
          style={{ width: "100%" }}
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={400} radius="md" />
          ))}
        </SimpleGrid>
      </Stack>
    );
  }

  if (isError) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={<Trans>Error</Trans>}
        color="red"
        data-testid={TestSelectors.PLAN_LIST_ERROR}
      >
        <Trans>Failed to load plans. Please try again later.</Trans>
      </Alert>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl" data-testid={TestSelectors.PLAN_LIST_EMPTY}>
        <Trans>No plans available at the moment.</Trans>
      </Text>
    );
  }

  const filteredPlans = plans.filter((plan) => plan.billingPeriod === billingPeriod);

  // If no plans for selected period, show all
  const displayPlans = filteredPlans.length > 0 ? filteredPlans : plans;

  return (
    <Stack gap="xl" align="center">
      <SegmentedControl
        value={billingPeriod}
        onChange={(value) => setBillingPeriod(value as "MONTHLY" | "ANNUAL")}
        data={[
          { label: <Trans>Monthly</Trans>, value: "MONTHLY" },
          { label: <Trans>Yearly</Trans>, value: "ANNUAL" },
        ]}
      />
      <SimpleGrid
        cols={{ base: 1, sm: 2, lg: 3 }}
        spacing="lg"
        data-testid={TestSelectors.PLAN_LIST}
        style={{ width: "100%" }}
      >
        {displayPlans.map((plan) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isCurrent={plan.planCode === currentPlanId}
            onSelect={onSelect}
            loading={selectingPlanId === plan.planCode}
          />
        ))}
      </SimpleGrid>
    </Stack>
  );
}
