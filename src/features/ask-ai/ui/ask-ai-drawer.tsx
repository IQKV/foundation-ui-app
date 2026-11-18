import { useRef, useEffect, useState } from "react";
import {
  Drawer,
  Stack,
  Group,
  Text,
  Box,
  Textarea,
  ActionIcon,
  UnstyledButton,
  ScrollArea,
  Alert,
  ThemeIcon,
} from "@mantine/core";
import { IconSparkles, IconArrowUp, IconAlertCircle, IconRefresh } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion, AnimatePresence } from "framer-motion";
import { useMessages, useSendMessage, useChatInputHistory } from "@/addons/platform-ai-chat/model";
import { MessageBubble } from "@/addons/platform-ai-chat/ui/message-bubble";
import { useAskAiPanelStore } from "../model/ask-ai-panel.store";
import type { AiContextAction } from "../model/ask-ai-panel.store";

const MAX_INPUT_CHARS = 4000;

// ─── Suggestion card ──────────────────────────────────────────────────────────

interface SuggestionCardProps {
  action: AiContextAction;
  index: number;
  onSelect: (message: string) => void;
}

function SuggestionCard({ action, index, onSelect }: SuggestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, type: "spring", stiffness: 340, damping: 28 }}
    >
      <UnstyledButton
        onClick={() => onSelect(action.message)}
        data-testid="ai-suggestion-card"
        style={{
          display: "block",
          width: "100%",
          padding: "10px 14px",
          borderRadius: "var(--mantine-radius-md)",
          border: "1px solid var(--mantine-color-gray-2)",
          background: "var(--app-surface-bg)",
          cursor: "pointer",
          transition: "border-color 120ms ease, background 120ms ease",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor =
            "var(--mantine-color-orange-5, #f76707)";
          (e.currentTarget as HTMLButtonElement).style.background =
            "var(--mantine-color-orange-0, #fff4e6)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--mantine-color-gray-2)";
          (e.currentTarget as HTMLButtonElement).style.background = "var(--app-surface-bg)";
        }}
      >
        <Text size="sm" fw={500} style={{ lineHeight: 1.4 }}>
          {action.label}
        </Text>
        {action.subtitle && (
          <Text size="xs" c="dimmed" mt={2}>
            {action.subtitle}
          </Text>
        )}
      </UnstyledButton>
    </motion.div>
  );
}

// ─── Suggestions section ──────────────────────────────────────────────────────

interface SuggestionsSectionProps {
  actions: AiContextAction[];
  onSelect: (message: string) => void;
}

function SuggestionsSection({ actions, onSelect }: SuggestionsSectionProps) {
  if (actions.length === 0) return null;

  return (
    <Box px="md" pb="sm">
      <Text
        size="xs"
        fw={600}
        c="dimmed"
        tt="uppercase"
        style={{ letterSpacing: "0.06em" }}
        mb="xs"
      >
        <Trans>Suggested</Trans>
      </Text>
      <Stack gap="xs">
        {actions.map((action, i) => (
          <SuggestionCard key={action.label} action={action} index={i} onSelect={onSelect} />
        ))}
      </Stack>
    </Box>
  );
}

// ─── Main drawer ──────────────────────────────────────────────────────────────

export function AskAiDrawer() {
  const { t } = useLingui();
  const { isOpen, close, sessionId, setSessionId, clearSession, contextActions, endpoints } =
    useAskAiPanelStore();

  const [content, setContent] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: messagesData } = useMessages(sessionId ?? "", endpoints ?? undefined);
  const hasMessages = (messagesData?.items.length ?? 0) > 0;

  const {
    addToHistory,
    handleKeyDown: handleHistoryKeyDown,
    resetNavigation,
  } = useChatInputHistory(content, setContent, messagesData?.items);

  const charsLeft = MAX_INPUT_CHARS - content.length;
  const isOverLimit = charsLeft < 0;

  const sendMutation = useSendMessage({
    endpoints: endpoints ?? undefined,
    onSuccess: (r) => {
      if (!sessionId) {
        setSessionId(r.sessionId);
      }
      setContent("");
    },
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [messagesData?.items.length]);

  function handleSubmit() {
    const trimmed = content.trim();
    if (!trimmed || isOverLimit || sendMutation.isPending) return;
    addToHistory(trimmed);
    sendMutation.mutate({ sessionId: sessionId ?? undefined, content: trimmed });
  }

  function handleSuggestionSelect(message: string) {
    addToHistory(message);
    sendMutation.mutate({ sessionId: sessionId ?? undefined, content: message });
  }

  function handleNewConversation() {
    clearSession();
    setContent("");
  }

  // Show suggestions only when no messages yet
  const showSuggestions = !hasMessages && contextActions.length > 0;

  return (
    <Drawer
      opened={isOpen}
      onClose={close}
      position="right"
      size={440}
      withCloseButton={false}
      padding={0}
      styles={{
        body: { height: "100%", padding: 0, display: "flex", flexDirection: "column" },
        content: { display: "flex", flexDirection: "column" },
      }}
      data-testid="ask-ai-drawer"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <Box
        px="md"
        py="sm"
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          flexShrink: 0,
        }}
      >
        <Group justify="space-between" align="flex-start">
          <Group gap="xs" align="center">
            <ThemeIcon
              size={32}
              radius="md"
              style={{
                background: "linear-gradient(135deg, #c44b0a 0%, #e8541a 100%)",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              <IconSparkles size={16} color="white" />
            </ThemeIcon>
            <Box>
              <Text size="sm" fw={600} style={{ lineHeight: 1.3 }}>
                <Trans>AI Assistant</Trans>
              </Text>
              <Text size="xs" c="dimmed">
                <Trans>Ask about your workspace, team or settings</Trans>
              </Text>
            </Box>
          </Group>

          <Group gap={4}>
            {/* New conversation — only shown when a session is active */}
            {sessionId && (
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={handleNewConversation}
                title={t`New conversation`}
                data-testid="ask-ai-new-conversation"
              >
                <IconRefresh size={14} />
              </ActionIcon>
            )}
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              onClick={close}
              aria-label={t`Close AI panel`}
              data-testid="ask-ai-close"
            >
              ✕
            </ActionIcon>
          </Group>
        </Group>
      </Box>

      {/* ── Scrollable body ────────────────────────────────────────────────── */}
      <ScrollArea flex={1} viewportRef={scrollRef} data-testid="ask-ai-scroll-area">
        <Stack gap={0} py="sm">
          {/* Welcome / empty state */}
          {!hasMessages && contextActions.length === 0 && (
            <Box px="md" pb="md">
              <Text
                size="xs"
                fw={600}
                c="orange.7"
                tt="uppercase"
                style={{ letterSpacing: "0.06em" }}
                mb="xs"
              >
                <Trans>+ Ask AI</Trans>
              </Text>
              <Text size="sm" c="dimmed" style={{ lineHeight: 1.6 }}>
                <Trans>
                  Ask a question or pick a suggestion. The AI works from records in this workspace
                  and links every answer to its source.
                </Trans>
              </Text>
            </Box>
          )}

          {/* Page-level context actions */}
          {showSuggestions && (
            <SuggestionsSection actions={contextActions} onSelect={handleSuggestionSelect} />
          )}

          {/* Chat messages */}
          {hasMessages && (
            <Stack gap="xs" px="md">
              {messagesData!.items.map((m) => (
                <MessageBubble key={m.id} message={m} />
              ))}
              {sendMutation.isPending && (
                <Group gap="xs" pl={44}>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "#e8541a",
                      }}
                      animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                      transition={{
                        duration: 0.9,
                        repeat: Infinity,
                        delay: i * 0.18,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </Group>
              )}
            </Stack>
          )}
        </Stack>
      </ScrollArea>

      {/* ── Input area ─────────────────────────────────────────────────────── */}
      <Box
        px="md"
        pt="sm"
        pb="md"
        style={{
          borderTop: "1px solid var(--mantine-color-gray-2)",
          flexShrink: 0,
          background: "var(--app-surface-bg)",
        }}
      >
        {sendMutation.error && (
          <Alert
            icon={<IconAlertCircle size={14} />}
            color="red"
            variant="light"
            mb="xs"
            py="xs"
            styles={{ message: { fontSize: "var(--mantine-font-size-xs)" } }}
          >
            <Trans>Failed to send. Please try again.</Trans>
          </Alert>
        )}
        <Group align="flex-end" gap="xs">
          <Textarea
            flex={1}
            autosize
            minRows={1}
            maxRows={6}
            placeholder={t`Ask about your workspace…`}
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
            error={isOverLimit ? t`Message too long` : undefined}
            styles={{
              input: {
                borderRadius: "var(--mantine-radius-md)",
                paddingRight: 8,
              },
            }}
            data-testid="ask-ai-input"
          />
          <ActionIcon
            size={36}
            radius="md"
            disabled={!content.trim() || isOverLimit || sendMutation.isPending}
            onClick={handleSubmit}
            aria-label={t`Send message`}
            data-testid="ask-ai-send"
            style={{
              background:
                content.trim() && !isOverLimit && !sendMutation.isPending
                  ? "linear-gradient(135deg, #c44b0a 0%, #e8541a 100%)"
                  : undefined,
              border: "none",
              color: "white",
              flexShrink: 0,
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {sendMutation.isPending ? (
                <motion.div
                  key="pending"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12 }}
                >
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      style={{
                        width: 4,
                        height: 4,
                        borderRadius: "50%",
                        background: "white",
                        display: "inline-block",
                        margin: "0 1px",
                      }}
                      animate={{ opacity: [0.3, 1, 0.3] }}
                      transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key="arrow"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.12 }}
                >
                  <IconArrowUp size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </ActionIcon>
        </Group>
        <AnimatePresence>
          {charsLeft < 200 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Text size="xs" ta="right" c={isOverLimit ? "red" : "dimmed"} mt={4}>
                {charsLeft.toLocaleString()} / {MAX_INPUT_CHARS.toLocaleString()}
              </Text>
            </motion.div>
          )}
        </AnimatePresence>
      </Box>
    </Drawer>
  );
}
