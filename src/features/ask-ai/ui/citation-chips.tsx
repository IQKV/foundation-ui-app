import { Badge, Group, Text, Tooltip } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";
import type { VenueChatSource } from "@/shared/api";

interface CitationChipsProps {
  sources: VenueChatSource[];
  onOpen: (sourceTextId: string) => void;
}

/**
 * The source chunks one assistant reply was grounded in. Clicking a chip opens that
 * source's preview.
 */
export function CitationChips({ sources, onOpen }: CitationChipsProps) {
  const { t } = useLingui();

  if (sources.length === 0) {
    return null;
  }

  return (
    <Group gap={6} mt={6} pl={44} wrap="wrap" data-testid="ai-citations">
      <Text size="xs" c="dimmed">
        <Trans>Sources</Trans>
      </Text>
      {sources.map((source, index) => {
        const label = source.label ?? t`Source ${index + 1}`;
        return (
          <Tooltip key={source.sourceTextId} label={source.snippet} withArrow maw={320} multiline>
            <Badge
              component="button"
              type="button"
              variant="light"
              color="gray"
              radius="sm"
              size="sm"
              onClick={() => onOpen(source.sourceTextId)}
              data-testid="ai-citation"
            >
              {source.page ? t`${label} · p.${source.page}` : label}
            </Badge>
          </Tooltip>
        );
      })}
    </Group>
  );
}
