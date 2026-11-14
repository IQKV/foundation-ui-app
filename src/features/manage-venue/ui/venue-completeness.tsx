/**
 * Read-only profile completeness indicators for a tenant venue.
 * Client-side only: derived from the venue's raw `metadata` document.
 */

import {
  Badge,
  Box,
  Center,
  Divider,
  Group,
  Paper,
  Progress,
  RingProgress,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconAlertTriangle, IconCheck, IconClipboardCheck } from "@tabler/icons-react";
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

/** Details-tab card: overall percentage plus a per-section breakdown. */
export function VenueCompletenessCard({
  completeness,
  isLoading = false,
}: VenueCompletenessCardProps) {
  const { t } = useLingui();
  const { filled, total, percent, sections } = completeness;
  const color = completenessColor(percent);
  const allFilled = total > 0 && filled === total;

  return (
    <Paper withBorder radius="md" p="lg" shadow="sm">
      <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
        <Group gap={8}>
          <ThemeIcon size={28} radius="sm" variant="light" color="blue">
            <IconClipboardCheck size={14} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text size="md" fw={700}>
              <Trans>Profile completeness</Trans>
            </Text>
            <Text size="xs" c="dimmed">
              <Trans>Populated fields across the venue profile.</Trans>
            </Text>
          </Stack>
        </Group>
        {total > 0 && (
          <Badge
            variant="light"
            color={allFilled ? "teal" : "gray"}
            size="xs"
            leftSection={
              allFilled ? (
                <IconCheck size={10} style={{ marginTop: 1 }} />
              ) : (
                <IconAlertTriangle size={10} style={{ marginTop: 1 }} />
              )
            }
          >
            {filled}/{total}
          </Badge>
        )}
      </Group>

      <Divider my="sm" />

      {isLoading ? (
        <Skeleton height={140} radius="sm" />
      ) : (
        <>
          <Group gap="lg" align="center" wrap="nowrap">
            <RingProgress
              size={88}
              thickness={9}
              roundCaps
              sections={[{ value: percent, color }]}
              label={
                <Center>
                  <Text size="lg" fw={800} c={color} lh={1}>
                    {percent}%
                  </Text>
                </Center>
              }
            />
            <Stack gap={2}>
              <Text size="sm" fw={600}>
                {t`${filled} of ${total} fields filled`}
              </Text>
              <Text size="xs" c="dimmed">
                <Trans>Read-only fields are not counted.</Trans>
              </Text>
            </Stack>
          </Group>

          {sections.length > 0 && (
            <>
              <Divider my="sm" />
              <Stack gap="xs">
                {sections.map((row) => {
                  const rowPercent =
                    row.total === 0 ? 0 : Math.round((row.filled / row.total) * 100);
                  return (
                    <Box key={row.key}>
                      <Group justify="space-between" gap="xs" wrap="nowrap" mb={4}>
                        <Text size="xs" fw={600}>
                          {row.label}
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace" style={{ flexShrink: 0 }}>
                          {row.filled}/{row.total}
                        </Text>
                      </Group>
                      <Progress
                        value={rowPercent}
                        size="xs"
                        radius="xl"
                        color={completenessColor(rowPercent)}
                      />
                    </Box>
                  );
                })}
              </Stack>
            </>
          )}
        </>
      )}
    </Paper>
  );
}
