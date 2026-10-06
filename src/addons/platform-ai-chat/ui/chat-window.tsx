import { useRef, useEffect, useState } from "react";
import {
  ScrollArea,
  Stack,
  Group,
  Textarea,
  Button,
  Loader,
  Alert,
  Text,
  Paper,
} from "@mantine/core";
import { IconSend, IconAlertCircle } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useMessages, useSendMessage } from "../model";
import { MessageBubble } from "./message-bubble";

interface ChatWindowProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
}

export function ChatWindow({ sessionId, onSessionCreated }: ChatWindowProps) {
  const { t } = useLingui();
  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messagesData } = useMessages(sessionId ?? "");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messagesData?.items.length]);

  const sendMutation = useSendMessage({
    onSuccess: (r) => {
      if (!sessionId) {
        onSessionCreated(r.sessionId);
      }
      setContent("");
    },
  });

  function handleSubmit() {
    if (!content.trim()) return;
    sendMutation.mutate({
      sessionId: sessionId ?? undefined,
      content: content.trim(),
    });
  }

  return (
    <Stack h="100%" gap={0}>
      <ScrollArea flex={1} viewportRef={scrollRef} data-testid="chat-scroll-area">
        <Stack gap="xs" p="md">
          {!sessionId && (
            <Text c="dimmed" ta="center" py="xl">
              <Trans>Select a session or start a new chat.</Trans>
            </Text>
          )}
          {messagesData?.items.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
        </Stack>
      </ScrollArea>

      <Paper
        p="md"
        radius="xl"
        style={{
          borderTop: "1px solid rgba(176,186,201,0.5)",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          background: "rgba(255,255,255,0.55)",
          backdropFilter: "blur(8px)",
        }}
      >
        {sendMutation.error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="sm">
            <Trans>Failed to send message. Please try again.</Trans>
          </Alert>
        )}
        <Group align="flex-end" gap="sm">
          <Textarea
            flex={1}
            autosize
            minRows={3}
            maxRows={8}
            placeholder={t`Type a message… (Enter to send, Shift+Enter for new line)`}
            value={content}
            onChange={(e) => setContent(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            disabled={sendMutation.isPending}
            data-testid="chat-input"
          />
          <Button
            size="md"
            onClick={handleSubmit}
            disabled={!content.trim() || sendMutation.isPending}
            data-testid="send-btn"
          >
            {sendMutation.isPending ? <Loader size="xs" color="white" /> : <IconSend size={18} />}
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
}
