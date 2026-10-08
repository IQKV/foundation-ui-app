import { Group, Paper, Text } from "@mantine/core";
import { IconRobot } from "@tabler/icons-react";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
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

/**
 * Renders assistant message content as markdown.
 * Scoped styles keep it contained inside the bubble Paper.
 */
function MarkdownContent({ content }: { content: string }) {
  return (
    <div
      style={{
        fontSize: "var(--mantine-font-size-sm)",
        lineHeight: 1.6,
      }}
    >
      <ReactMarkdown
        components={{
          // Paragraphs — tight margin
          p: ({ children }) => <p style={{ margin: "0 0 0.5em 0" }}>{children}</p>,
          // Inline code
          code: ({ children, className }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre
                  style={{
                    background: "rgba(0,0,0,0.08)",
                    borderRadius: 6,
                    padding: "0.6em 0.8em",
                    overflowX: "auto",
                    fontSize: "0.85em",
                    margin: "0.5em 0",
                  }}
                >
                  <code>{children}</code>
                </pre>
              );
            }
            return (
              <code
                style={{
                  background: "rgba(0,0,0,0.08)",
                  borderRadius: 3,
                  padding: "0.1em 0.35em",
                  fontSize: "0.88em",
                  fontFamily: "var(--mantine-font-family-monospace)",
                }}
              >
                {children}
              </code>
            );
          },
          // Bold
          strong: ({ children }) => <strong style={{ fontWeight: 600 }}>{children}</strong>,
          // Lists
          ul: ({ children }) => (
            <ul style={{ margin: "0.25em 0", paddingLeft: "1.4em" }}>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol style={{ margin: "0.25em 0", paddingLeft: "1.4em" }}>{children}</ol>
          ),
          li: ({ children }) => <li style={{ marginBottom: "0.2em" }}>{children}</li>,
          // Headings — scaled down for a chat bubble
          h1: ({ children }) => (
            <p style={{ fontWeight: 700, fontSize: "1.05em", margin: "0.4em 0 0.2em" }}>
              {children}
            </p>
          ),
          h2: ({ children }) => (
            <p style={{ fontWeight: 600, fontSize: "1em", margin: "0.4em 0 0.2em" }}>{children}</p>
          ),
          h3: ({ children }) => (
            <p style={{ fontWeight: 600, margin: "0.3em 0 0.1em" }}>{children}</p>
          ),
          // Blockquote
          blockquote: ({ children }) => (
            <blockquote
              style={{
                borderLeft: "3px solid rgba(0,0,0,0.2)",
                paddingLeft: "0.8em",
                margin: "0.4em 0",
                opacity: 0.8,
              }}
            >
              {children}
            </blockquote>
          ),
          // Horizontal rule
          hr: () => (
            <hr
              style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.15)", margin: "0.6em 0" }}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

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
            radius="md"
            maw="75%"
            style={{ borderBottomRightRadius: 4 }}
          >
            {/* User messages: preserve whitespace/newlines, no heavy markdown */}
            <Text size="sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {message.content}
            </Text>
            <Text size="xs" c="white" opacity={0.7} ta="right" mt={4}>
              {timeStr}
            </Text>
          </Paper>
        </Group>
      </motion.div>
    );
  }

  // ASSISTANT — full markdown rendering
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
        <Paper bg="gray.1" p="md" radius="md" maw="75%" style={{ borderBottomLeftRadius: 4 }}>
          <MarkdownContent content={message.content} />
          <Text size="xs" c="dimmed" mt={6}>
            {timeStr}
          </Text>
        </Paper>
      </Group>
    </motion.div>
  );
}
