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
import { MoodBlob } from "mood-blobs";
import { useMessages, useSendMessage, useChatInputHistory } from "../model";
import { MessageBubble } from "./message-bubble";

type BlobMood = "excited" | "happy" | "surprised" | "cool" | "sad";

function resolveMood(opts: {
  isPending: boolean;
  isError: boolean;
  justCreated: boolean;
}): BlobMood {
  if (opts.isError) return "sad";
  if (opts.isPending) return "cool";
  if (opts.justCreated) return "surprised";
  return "excited";
}

// Colors tuned to the app's slate-indigo palette (src/app/theme.ts)
const BLOB_COLORS: Record<BlobMood, string> = {
  excited: "#5465f5", // blue-5 — primary, "ready"
  cool: "#8896aa", // gray-5 — calm slate while sending
  surprised: "#7280f8", // blue-4 — soft primary for new-session flash
  sad: "#FF6B6B", // keep coral red — clear error signal
  happy: "#55EFC4", // mint — warm success (unused path, kept for completeness)
};

const MAX_INPUT_CHARS = 4000;

interface ChatWindowProps {
  sessionId: string | null;
  onSessionCreated: (sessionId: string) => void;
}

export function ChatWindow({ sessionId, onSessionCreated }: ChatWindowProps) {
  const { t } = useLingui();
  const [content, setContent] = useState("");
  const [justCreated, setJustCreated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messagesData } = useMessages(sessionId ?? "");

  const {
    addToHistory,
    handleKeyDown: handleHistoryKeyDown,
    resetNavigation,
  } = useChatInputHistory(content, setContent, messagesData?.items);

  const charsLeft = MAX_INPUT_CHARS - content.length;
  const isOverLimit = charsLeft < 0;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messagesData?.items.length]);

  const sendMutation = useSendMessage({
    onSuccess: (r) => {
      if (!sessionId) {
        onSessionCreated(r.sessionId);
        setJustCreated(true);
        setTimeout(() => setJustCreated(false), 2000);
      }
      setContent("");
    },
  });

  function handleSubmit() {
    if (!content.trim() || isOverLimit) return;
    const trimmed = content.trim();
    addToHistory(trimmed);
    sendMutation.mutate({
      sessionId: sessionId ?? undefined,
      content: trimmed,
    });
  }

  const blobMood = resolveMood({
    isPending: sendMutation.isPending,
    isError: !!sendMutation.error,
    justCreated,
  });

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
          <MoodBlob
            mood={blobMood}
            color={BLOB_COLORS[blobMood]}
            size="xs"
            style={{ flexShrink: 0 }}
          />
          <Stack flex={1} gap={4}>
            <Textarea
              autosize
              minRows={3}
              maxRows={8}
              placeholder={t`Type a message… (Enter to send, Shift+Enter for new line)`}
              value={content}
              onChange={(e) => {
                resetNavigation();
                setContent(e.currentTarget.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                  return;
                }
                handleHistoryKeyDown(e);
              }}
              disabled={sendMutation.isPending}
              error={
                isOverLimit ? t`Message exceeds ${MAX_INPUT_CHARS} character limit` : undefined
              }
              data-testid="chat-input"
            />
            <Text
              size="xs"
              ta="right"
              c={isOverLimit ? "red" : charsLeft < 200 ? "orange" : "dimmed"}
            >
              {charsLeft.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
            </Text>
          </Stack>
          <Button
            size="md"
            onClick={handleSubmit}
            disabled={!content.trim() || isOverLimit || sendMutation.isPending}
            data-testid="send-btn"
          >
            {sendMutation.isPending ? <Loader size="xs" color="white" /> : <IconSend size={18} />}
          </Button>
        </Group>
      </Paper>
    </Stack>
  );
}
