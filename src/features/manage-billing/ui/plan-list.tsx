import { SimpleGrid, Skeleton, Text, Alert } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { usePlans } from "../model/use-plans";
import { PlanCard } from "./plan-card";
import type { Plan } from "@/shared/api";

interface PlanListProps {
  currentPlanId?: string;
  onSelect?: (plan: Plan) => void;
  selectingPlanId?: string;
}

export function PlanList({ currentPlanId, onSelect, selectingPlanId }: PlanListProps) {
  const { data: plans, isLoading, isError } = usePlans();

  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} height={400} radius="md" />
        ))}
      </SimpleGrid>
    );
  }

  if (isError) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} title={<Trans>Error</Trans>} color="red">
        <Trans>Failed to load plans. Please try again later.</Trans>
      </Alert>
    );
  }

  if (!plans || plans.length === 0) {
    return (
      <Text c="dimmed" ta="center" py="xl">
        <Trans>No plans available at the moment.</Trans>
      </Text>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
      {plans.map((plan) => (
        <PlanCard
          key={plan.id}
          plan={plan}
          isCurrent={plan.planCode === currentPlanId}
          onSelect={onSelect}
          loading={selectingPlanId === plan.planCode}
        />
      ))}
    </SimpleGrid>
  );
}
