import { useRef, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCheck,
  IconChevronRight,
  IconRobot,
  IconSend,
  IconSparkles,
  IconUser,
  IconX,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import type { VenueEnrichmentSuggestion } from "@/entities/venue";
import { METADATA_SECTIONS } from "../model";
import type { UseVenueEnrichmentResult } from "../model";

// ─── Field hint options derived from the metadata spec ───────────────────────

const FIELD_HINT_OPTIONS = [
  { value: "", label: "All fields" },
  ...Array.from(new Set(METADATA_SECTIONS.map((s) => s.tab))).map((tab) => ({
    value: tab,
    label: tab.charAt(0).toUpperCase() + tab.slice(1),
  })),
];

// ─── Patch diff chip ──────────────────────────────────────────────────────────

function PatchChip({
  patch,
  onAccept,
  onDismiss,
  accepted,
}: {
  patch: VenueEnrichmentSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
  accepted: boolean;
}) {
  // Resolve a human-readable field label from the metadata spec.
  const fieldDef = METADATA_SECTIONS.flatMap((s) => s.fields).find(
    (f) => f.key === `${patch.group}.${patch.field}` || f.key === patch.field,
  );
  const label = fieldDef?.label ?? `${patch.group} / ${patch.field}`;

  return (
    <Paper
      withBorder
      px="sm"
      py={6}
      radius="sm"
      style={{
        borderColor: accepted ? "var(--mantine-color-teal-4)" : "var(--mantine-color-blue-3)",
        background: accepted ? "var(--mantine-color-teal-0)" : "var(--mantine-color-blue-0)",
        opacity: accepted ? 0.7 : 1,
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
          <IconChevronRight
            size={12}
            color="var(--mantine-color-blue-6)"
            style={{ flexShrink: 0 }}
          />
          <Stack gap={0} style={{ minWidth: 0 }}>
            <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
              {label}
            </Text>
            <Text size="sm" fw={500} style={{ wordBreak: "break-word" }}>
              {patch.value}
            </Text>
          </Stack>
        </Group>
        {accepted ? (
          <ThemeIcon size={20} radius="xl" color="teal" variant="light" style={{ flexShrink: 0 }}>
            <IconCheck size={12} />
          </ThemeIcon>
        ) : (
          <Group gap={4} style={{ flexShrink: 0 }}>
            <ActionIcon
              size="xs"
              variant="light"
              color="teal"
              aria-label="Accept suggestion"
              onClick={onAccept}
            >
              <IconCheck size={11} />
            </ActionIcon>
            <ActionIcon
              size="xs"
              variant="light"
              color="gray"
              aria-label="Dismiss suggestion"
              onClick={onDismiss}
            >
              <IconX size={11} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Paper>
  );
}

// ─── Chat turn ────────────────────────────────────────────────────────────────

function ChatTurn({
  message,
  reply,
  patches,
  onAcceptPatch,
  onDismissPatch,
  acceptedKeys,
}: {
  message: string;
  reply: string;
  patches: VenueEnrichmentSuggestion[];
  onAcceptPatch: (patch: VenueEnrichmentSuggestion) => void;
  onDismissPatch: (patch: VenueEnrichmentSuggestion) => void;
  acceptedKeys: Set<string>;
}) {
  return (
    <Stack gap="xs">
      {/* User bubble */}
      <Group justify="flex-end">
        <Paper
          px="sm"
          py={6}
          radius="md"
          style={{
            background: "var(--mantine-color-blue-6)",
            maxWidth: "75%",
          }}
        >
          <Group gap={6} wrap="nowrap" align="flex-start">
            <ThemeIcon
              size={18}
              radius="xl"
              color="blue"
              variant="filled"
              style={{ flexShrink: 0, marginTop: 1 }}
            >
              <IconUser size={11} />
            </ThemeIcon>
            <Text size="sm" style={{ color: "#fff", wordBreak: "break-word" }}>
              {message}
            </Text>
          </Group>
        </Paper>
      </Group>

      {/* AI bubble */}
      <Group justify="flex-start" align="flex-start">
        <ThemeIcon
          size={24}
          radius="xl"
          color="violet"
          variant="light"
          style={{ flexShrink: 0, marginTop: 2 }}
        >
          <IconRobot size={14} />
        </ThemeIcon>
        <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
          <Paper
            px="sm"
            py={6}
            radius="md"
            withBorder
            style={{ background: "var(--mantine-color-gray-0)" }}
          >
            <Text size="sm" style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              {reply}
            </Text>
          </Paper>
          {patches.length > 0 && (
            <Stack gap={4}>
              {patches.map((patch) => {
                const key = `${patch.group}.${patch.field}`;
                return (
                  <PatchChip
                    key={key}
                    patch={patch}
                    accepted={acceptedKeys.has(key)}
                    onAccept={() => onAcceptPatch(patch)}
                    onDismiss={() => onDismissPatch(patch)}
                  />
                );
              })}
            </Stack>
          )}
        </Stack>
      </Group>
    </Stack>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface VenueAiEnrichModalProps {
  opened: boolean;
  onClose: () => void;
  enrichment: UseVenueEnrichmentResult;
  currentMetadata: string | null;
}

export function VenueAiEnrichModal({
  opened,
  onClose,
  enrichment,
  currentMetadata,
}: VenueAiEnrichModalProps) {
  const { t } = useLingui();
  const [message, setMessage] = useState("");
  const [fieldHint, setFieldHint] = useState("");
  // Track which patches from history turns have been individually accepted.
  const [acceptedKeys, setAcceptedKeys] = useState<Set<string>>(new Set());
  const viewport = useRef<HTMLDivElement>(null);

  const {
    history,
    pendingPatches,
    dismissPatch,
    isSuggesting,
    isApplying,
    suggestError,
    applyError,
    send,
    applyPatches,
    reset,
  } = enrichment;

  function handleSend() {
    const trimmed = message.trim();
    if (!trimmed || isSuggesting) return;
    send(trimmed, fieldHint || undefined);
    setMessage("");
    // Scroll to bottom after render.
    setTimeout(
      () => viewport.current?.scrollTo({ top: viewport.current.scrollHeight, behavior: "smooth" }),
      100,
    );
  }

  function handleAcceptPatch(patch: VenueEnrichmentSuggestion) {
    const key = `${patch.group}.${patch.field}`;
    setAcceptedKeys((prev) => new Set([...prev, key]));
  }

  function handleDismissPatch(patch: VenueEnrichmentSuggestion) {
    dismissPatch(patch);
    const key = `${patch.group}.${patch.field}`;
    setAcceptedKeys((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  }

  function handleApplyAccepted() {
    const accepted = pendingPatches.filter((p) => acceptedKeys.has(`${p.group}.${p.field}`));
    applyPatches(accepted, currentMetadata);
  }

  function handleApplyAll() {
    applyPatches(pendingPatches, currentMetadata);
  }

  function handleClose() {
    reset();
    setMessage("");
    setFieldHint("");
    setAcceptedKeys(new Set());
    onClose();
  }

  const acceptedCount = pendingPatches.filter((p) =>
    acceptedKeys.has(`${p.group}.${p.field}`),
  ).length;
  const hasPatches = pendingPatches.length > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Group gap={8}>
          <ThemeIcon
            size={24}
            radius="sm"
            variant="gradient"
            gradient={{ from: "violet", to: "blue" }}
          >
            <IconSparkles size={14} />
          </ThemeIcon>
          <Text fw={700} size="sm">
            <Trans>Fill with AI</Trans>
          </Text>
        </Group>
      }
      size="lg"
      centered
      styles={{
        body: {
          display: "flex",
          flexDirection: "column",
          gap: "var(--mantine-spacing-sm)",
          padding: "var(--mantine-spacing-md)",
        },
      }}
    >
      {/* Chat history */}
      <ScrollArea
        viewportRef={viewport}
        h={history.length === 0 ? undefined : 320}
        style={{ flex: 1 }}
      >
        {history.length === 0 ? (
          <Group gap={6} wrap="nowrap" align="flex-start" px={4} py={4}>
            <IconRobot
              size={13}
              color="var(--mantine-color-violet-6)"
              style={{ flexShrink: 0, marginTop: 3 }}
            />
            <Text size="xs" c="dimmed">
              <Trans>
                Describe your venue and I'll suggest which profile fields to fill in. Review and
                accept each suggestion before it's saved.
              </Trans>
            </Text>
          </Group>
        ) : (
          <Stack gap="md" px={4} pb={4}>
            {history.map((turn, i) => (
              <ChatTurn
                key={i}
                message={turn.message}
                reply={turn.response.reply}
                patches={turn.response.suggestedPatches ?? []}
                onAcceptPatch={handleAcceptPatch}
                onDismissPatch={handleDismissPatch}
                acceptedKeys={acceptedKeys}
              />
            ))}
            {isSuggesting && (
              <Group gap={6} pl={30}>
                <ThemeIcon size={24} radius="xl" color="violet" variant="light">
                  <IconRobot size={14} />
                </ThemeIcon>
                <Text size="sm" c="dimmed" fs="italic">
                  <Trans>Thinking…</Trans>
                </Text>
              </Group>
            )}
          </Stack>
        )}
      </ScrollArea>

      {(suggestError ?? applyError) && (
        <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="sm">
          <Text size="xs">
            <Trans>Something went wrong. Please try again.</Trans>
          </Text>
        </Alert>
      )}

      {/* Apply bar — shown when there are pending patches */}
      {hasPatches && (
        <>
          <Divider />
          <Group justify="space-between" wrap="nowrap">
            <Text size="xs" c="dimmed">
              {acceptedCount > 0 ? (
                <Trans>
                  {acceptedCount} of {pendingPatches.length} suggestions accepted
                </Trans>
              ) : (
                <Trans>
                  {pendingPatches.length} suggestion(s) — accept individually or apply all
                </Trans>
              )}
            </Text>
            <Group gap="xs">
              {acceptedCount > 0 && (
                <Button
                  size="xs"
                  variant="light"
                  color="teal"
                  leftSection={<IconCheck size={13} />}
                  loading={isApplying}
                  onClick={handleApplyAccepted}
                >
                  <Trans>Apply accepted ({acceptedCount})</Trans>
                </Button>
              )}
              <Button
                size="xs"
                variant="filled"
                color="blue"
                leftSection={<IconSparkles size={13} />}
                loading={isApplying}
                onClick={handleApplyAll}
              >
                <Trans>Apply all</Trans>
              </Button>
            </Group>
          </Group>
        </>
      )}

      {/* Composer — the primary control surface of the dialog */}
      <Paper withBorder radius="md" p="sm" style={{ background: "var(--mantine-color-gray-0)" }}>
        <Stack gap="xs">
          <Textarea
            size="md"
            placeholder={t`Describe your venue, e.g. "500-person rooftop bar in London with in-house catering"`}
            value={message}
            onChange={(e) => setMessage(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            minRows={4}
            maxRows={8}
            autosize
            disabled={isSuggesting}
            aria-label={t`Message to AI enrichment assistant`}
          />
          <Group justify="space-between" align="flex-end" gap="sm" wrap="nowrap">
            <Select
              size="sm"
              label={t`Focus on`}
              data={FIELD_HINT_OPTIONS}
              value={fieldHint}
              onChange={(v) => setFieldHint(v ?? "")}
              styles={{ root: { flex: "0 0 auto", minWidth: 170 } }}
            />
            <Group gap="sm" align="center" wrap="nowrap">
              <Text size="xs" c="dimmed" visibleFrom="sm">
                <Trans>Enter to send · Shift + Enter for a new line</Trans>
              </Text>
              <Button
                size="md"
                variant="filled"
                color="blue"
                leftSection={<IconSend size={16} />}
                loading={isSuggesting}
                disabled={!message.trim()}
                onClick={handleSend}
              >
                <Trans>Send</Trans>
              </Button>
            </Group>
          </Group>
        </Stack>
      </Paper>
    </Modal>
  );
}
