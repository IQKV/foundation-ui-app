import { Group, Paper, Text } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";
import type { ChatMessage } from "../api/ai-chat-api";

interface MessageBubbleProps {
  message: ChatMessage;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString();

  if (message.role === "SYSTEM") {
    return (
      <Text size="xs" c="dimmed" ta="center" py="xs" data-testid="message-bubble">
        {message.content}
      </Text>
    );
  }

  if (message.role === "USER") {
    return (
      <Group justify="flex-end" data-testid="message-bubble">
        <Paper bg="blue.6" c="white" p="sm" radius="md" maw="75%">
          <Text size="sm">{message.content}</Text>
          <Text size="xs" c="white" opacity={0.7} ta="right">
            {timeStr}
          </Text>
        </Paper>
      </Group>
    );
  }

  // ASSISTANT
  return (
    <Group justify="flex-start" align="flex-start" data-testid="message-bubble">
      <IconRobot size={20} style={{ marginTop: 8, flexShrink: 0 }} />
      <Paper bg="gray.1" p="sm" radius="md" maw="75%">
        <Text size="sm">{message.content}</Text>
        <Text size="xs" c="dimmed">
          {timeStr}
        </Text>
      </Paper>
    </Group>
  );
}
