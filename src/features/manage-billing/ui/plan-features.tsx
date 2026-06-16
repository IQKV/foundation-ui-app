import { Stack, Group, Text, ThemeIcon, Badge } from "@mantine/core";
import { IconCheck, IconX, IconUsers, IconFolder, IconHeadset } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import type { PlanFeatures as PlanFeaturesType } from "@/shared/api";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface PlanFeaturesProps {
  features: PlanFeaturesType;
  showTitle?: boolean;
}

interface FeatureItemProps {
  icon: React.ReactNode;
  label: React.ReactNode;
  value: boolean | number;
  isUnlimited?: boolean;
  testId?: string;
}

function FeatureItem({ icon, label, value, isUnlimited, testId }: FeatureItemProps) {
  const renderValue = () => {
    if (typeof value === "boolean") {
      return (
        <ThemeIcon
          size="sm"
          radius="xl"
          color={value ? "green" : "gray"}
          variant={value ? "filled" : "outline"}
        >
          {value ? <IconCheck size={12} /> : <IconX size={12} />}
        </ThemeIcon>
      );
    }

    if (isUnlimited) {
      return (
        <Badge color="blue" variant="light" size="sm">
          <Trans>Unlimited</Trans>
        </Badge>
      );
    }

    return (
      <Badge color="gray" variant="outline" size="sm">
        {value.toLocaleString()}
      </Badge>
    );
  };

  return (
    <Group justify="space-between" align="center" data-testid={testId}>
      <Group gap="xs">
        <ThemeIcon size="sm" radius="xl" variant="light" color="blue">
          {icon}
        </ThemeIcon>
        <Text size="sm">{label}</Text>
      </Group>
      {renderValue()}
    </Group>
  );
}

export function PlanFeatures({ features, showTitle = true }: PlanFeaturesProps) {
  return (
    <Stack gap="md" data-testid={TestSelectors.PLAN_FEATURES}>
      {showTitle && (
        <Text fw={500} size="sm" c="dimmed">
          <Trans>Plan Features</Trans>
        </Text>
      )}

      <Stack gap="sm">
        <FeatureItem
          icon={<IconHeadset size={14} />}
          label={<Trans>Priority Support</Trans>}
          value={features.prioritySupport}
          testId={TestSelectors.PLAN_FEATURE_PRIORITY_SUPPORT}
        />

        <FeatureItem
          icon={<IconUsers size={14} />}
          label={<Trans>Team Members</Trans>}
          value={features.maxUsers}
          isUnlimited={features.maxUsers === 0}
          testId={TestSelectors.PLAN_FEATURE_MAX_USERS}
        />

        <FeatureItem
          icon={<IconFolder size={14} />}
          label={<Trans>Projects</Trans>}
          value={features.maxProjects}
          isUnlimited={features.maxProjects === 0}
          testId={TestSelectors.PLAN_FEATURE_MAX_PROJECTS}
        />
      </Stack>
    </Stack>
  );
}
