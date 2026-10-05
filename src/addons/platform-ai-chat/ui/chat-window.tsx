import { useRef, useEffect, useState } from "react";
import {
  ScrollArea,
  Stack,
  Group,
  Textarea,
  Button,
  Select,
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
  const [model, setModel] = useState("llama3.2");
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
      model,
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
        withBorder
        p="sm"
        style={{ borderTop: "1px solid var(--mantine-color-gray-3)" }}
        radius={0}
      >
        {sendMutation.error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light" mb="xs">
            <Trans>Failed to send message. Please try again.</Trans>
          </Alert>
        )}
        <Group align="flex-end" gap="xs">
          <Select
            size="sm"
            w={130}
            value={model}
            onChange={(v) => v && setModel(v)}
            data={[
              { value: "llama3.2", label: "Llama 3.2" },
              { value: "llama3.1", label: "Llama 3.1" },
              { value: "mistral", label: "Mistral" },
            ]}
            data-testid="model-select"
          />
          <Textarea
            flex={1}
            autosize
            minRows={1}
            maxRows={4}
            placeholder={t`Type a message…`}
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
            onClick={handleSubmit}
            disabled={!content.trim() || sendMutation.isPending}
            data-testid="send-btn"
          >
            {sendMutation.isPending ? <Loader size="xs" color="white" /> : <IconSend size={16} />}
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
}
