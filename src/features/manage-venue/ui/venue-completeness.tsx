/**
 * Read-only profile completeness indicators for a tenant venue.
 * Client-side only: derived from the venue's raw `metadata` document.
 */

import {
  Center,
  Group,
  Paper,
  Progress,
  RingProgress,
  Skeleton,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconClipboardCheck } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import type { MetadataCompleteness } from "../model";

/** Green ≥ 80%, orange ≥ 50%, red below — same thresholds as the admin confidence ring. */
export function completenessColor(percent: number): string {
  if (percent >= 80) return "green";
  if (percent >= 50) return "orange";
  return "red";
}

interface CompletenessRingProps {
  percent: number;
  isLoading?: boolean;
}

/** Compact ring for the profile header. */
export function CompletenessRing({ percent, isLoading = false }: CompletenessRingProps) {
  const { t } = useLingui();

  if (isLoading) return <Skeleton circle height={52} width={52} />;

  const color = completenessColor(percent);
  return (
    <RingProgress
      size={52}
      thickness={5}
      roundCaps
      sections={[{ value: percent, color }]}
      label={
        <Center>
          <Text size="xs" fw={700} c={color} lh={1}>
            {percent}%
          </Text>
        </Center>
      }
      aria-label={t`Profile completeness`}
    />
  );
}

interface VenueCompletenessCardProps {
  completeness: MetadataCompleteness;
  isLoading?: boolean;
}

/** Details-tab card: deliberately understated one-line completeness summary. */
export function VenueCompletenessCard({
  completeness,
  isLoading = false,
}: VenueCompletenessCardProps) {
  const { filled, total, percent } = completeness;

  return (
    <Paper withBorder radius="md" px="md" py="sm">
      {isLoading ? (
        <Skeleton height={22} radius="sm" />
      ) : (
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={22} radius="sm" variant="light" color="gray" style={{ flexShrink: 0 }}>
            <IconClipboardCheck size={12} />
          </ThemeIcon>
          <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
            <Trans>Profile completeness</Trans>
          </Text>
          <Progress
            value={percent}
            size="xs"
            radius="xl"
            color="gray"
            style={{ flex: 1, minWidth: 40 }}
            aria-label={`${filled}/${total}`}
          />
          <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>
            {filled}/{total}
          </Text>
        </Group>
      )}
    </Paper>
  );
}
