import { Badge, Button, Group, Paper, Text } from "@mantine/core";
import { IconFilter, IconX } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import type { ReactNode } from "react";
import type { SemanticSearchFilters } from "@/shared/api";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface SemanticSearchFiltersSummaryProps {
  filters: SemanticSearchFilters | null | undefined;
  onClear: () => void;
}

/** Snake_case metadata values read better spaced out in the UI (e.g. "outside_allowed"). */
function humanize(value: string): string {
  return value.replace(/_/g, " ");
}

/**
 * Shows the hard filters the AI query planner derived from the natural-language query, so the
 * user can tell what the search understood. Renders nothing when no filters were derived.
 */
export function SemanticSearchFiltersSummary({
  filters,
  onClear,
}: SemanticSearchFiltersSummaryProps) {
  const { t } = useLingui();

  if (!filters) return null;

  const chips: ReactNode[] = [];

  if (filters.city) {
    const city = filters.city;
    chips.push(
      <Badge key="city" variant="light" color="blue" size="sm">
        <Trans>City: {city}</Trans>
      </Badge>,
    );
  }

  filters.venueTypes.forEach((type) => {
    const label = humanize(type);
    chips.push(
      <Badge key={`type-${type}`} variant="light" color="cyan" size="sm">
        <Trans>Type: {label}</Trans>
      </Badge>,
    );
  });

  if (filters.minCapacity != null && filters.maxCapacity != null) {
    const min = filters.minCapacity;
    const max = filters.maxCapacity;
    chips.push(
      <Badge key="capacity-range" variant="light" color="teal" size="sm">
        <Trans>
          {min}–{max} guests
        </Trans>
      </Badge>,
    );
  } else if (filters.minCapacity != null) {
    const min = filters.minCapacity;
    chips.push(
      <Badge key="capacity-min" variant="light" color="teal" size="sm">
        <Trans>{min}+ guests</Trans>
      </Badge>,
    );
  } else if (filters.maxCapacity != null) {
    const max = filters.maxCapacity;
    chips.push(
      <Badge key="capacity-max" variant="light" color="teal" size="sm">
        <Trans>up to {max} guests</Trans>
      </Badge>,
    );
  }

  if (filters.cateringPolicy) {
    const policy = humanize(filters.cateringPolicy);
    chips.push(
      <Badge key="catering" variant="light" color="grape" size="sm">
        <Trans>Catering: {policy}</Trans>
      </Badge>,
    );
  }

  filters.amenities.forEach((amenity) => {
    chips.push(
      <Badge key={`amenity-${amenity}`} variant="light" color="indigo" size="sm">
        <Trans>Amenity: {amenity}</Trans>
      </Badge>,
    );
  });

  if (filters.accessible) {
    chips.push(
      <Badge key="accessible" variant="light" color="green" size="sm">
        <Trans>Wheelchair accessible</Trans>
      </Badge>,
    );
  }

  if (chips.length === 0) return null;

  return (
    <Paper withBorder radius="md" p="xs" mb="md" data-testid={TestSelectors.VENUES_AI_FILTERS}>
      <Group gap="xs" wrap="wrap" align="center">
        <Group gap={6} wrap="nowrap">
          <IconFilter size={13} color="var(--mantine-color-blue-6)" />
          <Text size="xs" fw={600} c="dimmed">
            <Trans>AI filters</Trans>
          </Text>
        </Group>
        {chips}
        <Button
          variant="subtle"
          color="gray"
          size="compact-xs"
          leftSection={<IconX size={12} />}
          onClick={onClear}
          style={{ marginLeft: "auto" }}
          aria-label={t`Clear AI search`}
        >
          <Trans>Clear AI search</Trans>
        </Button>
      </Group>
    </Paper>
  );
}
