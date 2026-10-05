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
import { motion, AnimatePresence } from "framer-motion";
import { useSessions, useDeleteSession } from "../model";

interface SessionsPanelProps {
  selectedSessionId: string | null;
  onSelect: (id: string | null) => void;
}

const sessionVariants = {
  hidden: { opacity: 0, x: -12 },
  visible: { opacity: 1, x: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.15 } },
};

export function SessionsPanel({ selectedSessionId, onSelect }: SessionsPanelProps) {
  const { data, isLoading } = useSessions();
  const deleteSession = useDeleteSession();

  return (
    <Stack gap="xs" w={280} data-testid="sessions-panel">
      <Button
        fullWidth
        variant="light"
        radius="xl"
        leftSection={<IconPlus size={14} />}
        onClick={() => onSelect(null)}
        data-testid="new-chat-btn"
      >
        <Trans>New Chat</Trans>
      </Button>

      {isLoading && (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} height={52} radius="lg" />
          ))}
        </>
      )}

      {!isLoading && (!data?.items || data.items.length === 0) && (
        <Text size="sm" c="dimmed" ta="center" py="md">
          <Trans>No conversations yet. Start a new chat.</Trans>
        </Text>
      )}

      <AnimatePresence initial={false}>
        {!isLoading &&
          data?.items.map((session) => (
            <motion.div
              key={session.id}
              variants={sessionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              layout
            >
              <Paper
                radius="lg"
                style={{ overflow: "hidden" }}
                bg={session.id === selectedSessionId ? "blue.0" : undefined}
                withBorder={session.id === selectedSessionId}
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
                        <Badge size="xs" variant="outline" radius="xl">
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
            </motion.div>
          ))}
      </AnimatePresence>
    </Stack>
  );
}
