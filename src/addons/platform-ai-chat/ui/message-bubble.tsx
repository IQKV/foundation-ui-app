import { Group, Paper, Text } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";
import { motion } from "framer-motion";
import type { ChatMessage } from "../api/ai-chat-api";

interface MessageBubbleProps {
  message: ChatMessage;
}

const bubbleVariants = {
  hidden: { opacity: 0, y: 8, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 320, damping: 28 },
  },
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const timeStr = new Date(message.createdAt).toLocaleTimeString();

  if (message.role === "SYSTEM") {
    return (
      <motion.div variants={bubbleVariants} initial="hidden" animate="visible">
        <Text size="xs" c="dimmed" ta="center" py="xs" data-testid="message-bubble">
          {message.content}
        </Text>
      </motion.div>
    );
  }

  if (message.role === "USER") {
    return (
      <motion.div variants={bubbleVariants} initial="hidden" animate="visible">
        <Group justify="flex-end" data-testid="message-bubble">
          <Paper
            bg="blue.6"
            c="white"
            p="md"
            radius="xl"
            maw="75%"
            style={{ borderBottomRightRadius: 6 }}
          >
            <Text size="sm">{message.content}</Text>
            <Text size="xs" c="white" opacity={0.7} ta="right" mt={4}>
              {timeStr}
            </Text>
          </Paper>
        </Group>
      </motion.div>
    );
  }

  // ASSISTANT
  return (
    <motion.div variants={bubbleVariants} initial="hidden" animate="visible">
      <Group justify="flex-start" align="flex-start" data-testid="message-bubble">
        <Paper
          bg="gray.0"
          p="xs"
          radius="xl"
          style={{
            marginTop: 8,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
          }}
        >
          <IconRobot size={16} />
        </Paper>
        <Paper bg="gray.1" p="md" radius="xl" maw="75%" style={{ borderBottomLeftRadius: 6 }}>
          <Text size="sm">{message.content}</Text>
          <Text size="xs" c="dimmed" mt={4}>
            {timeStr}
          </Text>
        </Paper>
      </Group>
    </motion.div>
  );
}
