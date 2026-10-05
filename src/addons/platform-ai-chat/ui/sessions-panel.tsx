import {
  Stack,
  Button,
  Skeleton,
  Text,
  Paper,
  Group,
  Badge,
  ActionIcon,
  UnstyledButton,
} from "@mantine/core";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useSessions, useDeleteSession } from "../model";

interface SessionsPanelProps {
  selectedSessionId: string | null;
  onSelect: (id: string | null) => void;
}

export function SessionsPanel({ selectedSessionId, onSelect }: SessionsPanelProps) {
  const { data, isLoading } = useSessions();
  const deleteSession = useDeleteSession();

  return (
    <Stack gap="xs" w={280} data-testid="sessions-panel">
      <Button
        fullWidth
        variant="light"
        leftSection={<IconPlus size={14} />}
        onClick={() => onSelect(null)}
        data-testid="new-chat-btn"
      >
        <Trans>New Chat</Trans>
      </Button>

      {isLoading && (
        <>
          <Skeleton height={52} radius="sm" />
          <Skeleton height={52} radius="sm" />
          <Skeleton height={52} radius="sm" />
          <Skeleton height={52} radius="sm" />
          <Skeleton height={52} radius="sm" />
        </>
      )}

      {!isLoading && (!data?.items || data.items.length === 0) && (
        <Text size="sm" c="dimmed" ta="center" py="md">
          <Trans>No conversations yet. Start a new chat.</Trans>
        </Text>
      )}

      {!isLoading &&
        data?.items.map((session) => (
          <Paper
            key={session.id}
            radius="sm"
            style={{ overflow: "hidden" }}
            bg={session.id === selectedSessionId ? "blue.0" : undefined}
          >
            <UnstyledButton
              w="100%"
              p="sm"
              onClick={() => onSelect(session.id)}
              style={{ display: "block" }}
            >
              <Group justify="space-between" wrap="nowrap" align="flex-start">
                <Stack gap={4} style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={500} truncate>
                    {session.title ?? "New chat"}
                  </Text>
                  <Group gap="xs">
                    <Badge size="xs" variant="outline">
                      {session.model}
                    </Badge>
                    <Text size="xs" c="dimmed">
                      {new Date(session.updatedAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </Stack>
                <ActionIcon
                  size="sm"
                  color="red"
                  variant="subtle"
                  data-testid="delete-session-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSession.mutate(session.id);
                  }}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>
            </UnstyledButton>
          </Paper>
        ))}
    </Stack>
  );
}
