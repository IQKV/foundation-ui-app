import { useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Progress,
  RingProgress,
  ScrollArea,
  Select,
  Stack,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconAlertCircle, IconCheck, IconSparkles, IconX } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import type { VenueTextContent } from "@/entities/venue";
import { METADATA_SECTIONS } from "../model";
import type { FieldExtractResult, UseVenueEnrichmentResult } from "../model";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SectionResult {
  sectionKey: string;
  sectionLabel: string;
  results: FieldExtractResult[];
  done: boolean;
  /** Field label currently being extracted, while in progress. */
  currentField: string | null;
}

// ─── Result row (per-field inside a section block) ───────────────────────────

function ResultRow({
  result,
  accepted,
  onAccept,
  onSkip,
}: {
  result: FieldExtractResult;
  accepted: boolean;
  onAccept: () => void;
  onSkip: () => void;
}) {
  const fieldDef = METADATA_SECTIONS.flatMap((s) => s.fields).find(
    (f) => f.key === `${result.group}.${result.field}` || f.key === result.field,
  );
  const label = fieldDef?.label ?? `${result.group} / ${result.field}`;

  return (
    <Box
      px="sm"
      py={6}
      style={{
        borderRadius: "var(--mantine-radius-sm)",
        background: accepted ? "var(--mantine-color-teal-0)" : "var(--mantine-color-violet-0)",
        border: `1px solid ${accepted ? "var(--mantine-color-teal-3)" : "var(--mantine-color-violet-3)"}`,
        opacity: accepted ? 0.75 : 1,
        transition: "opacity 0.15s",
      }}
    >
      <Group justify="space-between" wrap="nowrap" gap="xs">
        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
          <Text size="xs" c="dimmed">
            {label}
          </Text>
          <Text
            size="sm"
            fw={600}
            c={accepted ? "teal.7" : "violet.8"}
            style={{ wordBreak: "break-word" }}
          >
            {result.value}
          </Text>
          {result.evidence && (
            <Text
              size="xs"
              c="dimmed"
              fs="italic"
              lineClamp={2}
              style={{ borderLeft: "2px solid var(--mantine-color-violet-3)", paddingLeft: 6 }}
            >
              "{result.evidence}"
            </Text>
          )}
        </Stack>
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
              aria-label="Accept"
              onClick={onAccept}
            >
              <IconCheck size={11} />
            </ActionIcon>
            <ActionIcon size="xs" variant="light" color="gray" aria-label="Skip" onClick={onSkip}>
              <IconX size={11} />
            </ActionIcon>
          </Group>
        )}
      </Group>
    </Box>
  );
}

// ─── Section block ────────────────────────────────────────────────────────────

function SectionBlock({
  sr,
  acceptedKeys,
  onAccept,
  onSkip,
}: {
  sr: SectionResult;
  acceptedKeys: Set<string>;
  onAccept: (r: FieldExtractResult) => void;
  onSkip: (r: FieldExtractResult) => void;
}) {
  const foundCount = sr.results.length;

  return (
    <Stack gap={6}>
      <Group gap={6} align="center">
        <Text size="sm" fw={700}>
          {sr.sectionLabel}
        </Text>
        {sr.done && foundCount === 0 && (
          <Badge size="xs" color="gray" variant="light">
            <Trans>Nothing found</Trans>
          </Badge>
        )}
        {sr.done && foundCount > 0 && (
          <Badge size="xs" color="violet" variant="light">
            {foundCount}
          </Badge>
        )}
        {!sr.done && sr.currentField && (
          <Text size="xs" c="dimmed" fs="italic">
            {sr.currentField}…
          </Text>
        )}
      </Group>
      {sr.results.length > 0 && (
        <Stack gap={4}>
          {sr.results.map((r) => {
            const key = `${r.group}.${r.field}`;
            return (
              <ResultRow
                key={key}
                result={r}
                accepted={acceptedKeys.has(key)}
                onAccept={() => onAccept(r)}
                onSkip={() => onSkip(r)}
              />
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

interface VenueAiEnrichModalProps {
  opened: boolean;
  onClose: () => void;
  enrichment: UseVenueEnrichmentResult;
  currentMetadata: string | null;
  sources: VenueTextContent[];
}

export function VenueAiEnrichModal({
  opened,
  onClose,
  enrichment,
  currentMetadata,
  sources,
}: VenueAiEnrichModalProps) {
  const { t } = useLingui();
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [sectionResults, setSectionResults] = useState<SectionResult[]>([]);
  const [acceptedKeys, setAcceptedKeys] = useState<Set<string>>(new Set());
  const [doneCount, setDoneCount] = useState(0);

  // Prefer the venue text row's own label (title / file name); fall back to a content snippet.
  const sourceOptions = sources.map((s) => {
    const label = s.label?.trim() || s.content.trim().replace(/\s+/g, " ");
    return { value: s.id, label: label.slice(0, 72) + (label.length > 72 ? "…" : "") };
  });

  // Sections that have at least one empty editable field.
  const sectionsWithGaps = METADATA_SECTIONS.filter((section) => {
    const editable = section.fields.filter((f) => !f.readOnly);
    if (editable.length === 0) return false;
    // Parse current metadata to check emptiness.
    if (!currentMetadata) return true;
    try {
      const doc = JSON.parse(currentMetadata) as {
        items?: { group: string; field: string; value: unknown }[];
      };
      if (!doc?.items) return true;
      return editable.some((f) => {
        const parts = f.key.split(".").filter(Boolean);
        const grp = parts[0] ?? f.key;
        const fld = parts.length > 1 ? parts.slice(1).join(".") : f.key;
        const rows = doc.items!.filter((i) => i.group === grp && i.field === fld);
        if (rows.length === 0) return true;
        const val = rows[0]?.value;
        return val === null || val === undefined || val === "";
      });
    } catch {
      return true;
    }
  });

  const totalSections = sectionsWithGaps.length;
  const progressPct = totalSections === 0 ? 100 : Math.round((doneCount / totalSections) * 100);

  async function handleRun() {
    if (!sourceId || running) return;
    setRunning(true);
    setDoneCount(0);
    setSectionResults([]);
    setAcceptedKeys(new Set());

    // Initialise all section slots so they appear immediately (in order).
    setSectionResults(
      sectionsWithGaps.map((s) => ({
        sectionKey: s.key,
        sectionLabel: s.label,
        results: [],
        done: false,
        currentField: null,
      })),
    );

    for (const section of sectionsWithGaps) {
      await enrichment.extractSection(
        section.key,
        sourceId,
        currentMetadata,
        (result, fieldKey, done) => {
          const def = section.fields.find((f) => f.key === fieldKey);
          setSectionResults((prev) =>
            prev.map((sr) => {
              if (sr.sectionKey !== section.key) return sr;
              const newResults = result
                ? [
                    ...sr.results.filter(
                      (r) => !(r.group === result.group && r.field === result.field),
                    ),
                    result,
                  ]
                : sr.results;
              return {
                ...sr,
                results: newResults,
                done,
                currentField: done ? null : (def?.label ?? fieldKey),
              };
            }),
          );
          if (done) {
            setDoneCount((c) => c + 1);
          }
        },
      );
    }

    setRunning(false);
  }

  function handleAccept(r: FieldExtractResult) {
    setAcceptedKeys((prev) => new Set([...prev, `${r.group}.${r.field}`]));
  }

  function handleSkip(r: FieldExtractResult) {
    setAcceptedKeys((prev) => {
      const next = new Set(prev);
      next.delete(`${r.group}.${r.field}`);
      return next;
    });
    setSectionResults((prev) =>
      prev.map((sr) => ({
        ...sr,
        results: sr.results.filter((x) => !(x.group === r.group && x.field === r.field)),
      })),
    );
  }

  function handleApplyAccepted() {
    const allResults = sectionResults.flatMap((sr) => sr.results);
    const accepted = allResults.filter((r) => acceptedKeys.has(`${r.group}.${r.field}`));
    if (accepted.length > 0) {
      enrichment.applyPatches(
        accepted.map((r) => ({ group: r.group, field: r.field, value: r.value })),
        currentMetadata,
      );
    }
    handleClose();
  }

  function handleApplyAll() {
    const allResults = sectionResults.flatMap((sr) => sr.results);
    if (allResults.length > 0) {
      enrichment.applyPatches(
        allResults.map((r) => ({ group: r.group, field: r.field, value: r.value })),
        currentMetadata,
      );
    }
    handleClose();
  }

  function handleClose() {
    if (running) return;
    setRunning(false);
    setSectionResults([]);
    setAcceptedKeys(new Set());
    setDoneCount(0);
    onClose();
  }

  const totalFound = sectionResults.reduce((n, sr) => n + sr.results.length, 0);
  const acceptedCount = acceptedKeys.size;
  const allDone = !running && doneCount === totalSections && totalSections > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      closeOnClickOutside={false}
      closeOnEscape={!running}
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
            <Trans>Fill empty fields with AI</Trans>
          </Text>
        </Group>
      }
      size="lg"
      centered
    >
      <Stack gap="md" p="md" pt={0}>
        {/* Source picker + run */}
        {!running && sectionResults.length === 0 && (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              <Trans>
                Pick a source document. The AI reads it and suggests values for every empty profile
                field — you review and apply each one.
              </Trans>
            </Text>
            {sources.length === 0 ? (
              <Alert
                icon={<IconAlertCircle size={14} />}
                color="orange"
                variant="light"
                radius="sm"
              >
                <Text size="xs">
                  <Trans>
                    No source documents yet. Upload a PDF or paste text in the Sources tab first.
                  </Trans>
                </Text>
              </Alert>
            ) : (
              <>
                <Select
                  label={t`Source document`}
                  placeholder={t`Pick a source…`}
                  data={sourceOptions}
                  value={sourceId}
                  onChange={setSourceId}
                />
                <Group justify="space-between" align="center" wrap="nowrap">
                  <Text size="xs" c="dimmed">
                    {sectionsWithGaps.length === 0 ? (
                      <Trans>All fields are already filled.</Trans>
                    ) : (
                      <Trans>{sectionsWithGaps.length} sections with empty fields</Trans>
                    )}
                  </Text>
                  <Button
                    size="sm"
                    variant="gradient"
                    gradient={{ from: "violet", to: "blue" }}
                    leftSection={<IconSparkles size={15} />}
                    disabled={!sourceId || sectionsWithGaps.length === 0}
                    onClick={() => void handleRun()}
                  >
                    <Trans>Run</Trans>
                  </Button>
                </Group>
              </>
            )}
          </Stack>
        )}

        {/* Progress bar while running */}
        {(running || (allDone && sectionResults.length > 0)) && (
          <Stack gap={4}>
            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">
                {running ? (
                  <Trans>
                    {doneCount} / {totalSections} sections
                  </Trans>
                ) : (
                  <Trans>Done — {totalFound} suggestions</Trans>
                )}
              </Text>
              {allDone && (
                <Group gap={6}>
                  <RingProgress
                    size={28}
                    thickness={3}
                    sections={[{ value: 100, color: "teal" }]}
                    rootColor="var(--mantine-color-teal-1)"
                  />
                </Group>
              )}
            </Group>
            <Progress
              value={progressPct}
              color={allDone ? "teal" : "violet"}
              animated={running}
              radius="xl"
              size="sm"
            />
          </Stack>
        )}

        {/* Results */}
        {sectionResults.length > 0 && (
          <ScrollArea.Autosize mah={420}>
            <Stack gap="md" pr={4}>
              {sectionResults.map((sr) => (
                <SectionBlock
                  key={sr.sectionKey}
                  sr={sr}
                  acceptedKeys={acceptedKeys}
                  onAccept={handleAccept}
                  onSkip={handleSkip}
                />
              ))}
            </Stack>
          </ScrollArea.Autosize>
        )}

        {enrichment.applyError && (
          <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="sm">
            <Text size="xs">
              <Trans>Could not save. Please try again.</Trans>
            </Text>
          </Alert>
        )}

        {/* Apply bar */}
        {allDone && totalFound > 0 && (
          <>
            <Divider />
            <Group justify="space-between" wrap="nowrap">
              <Text size="xs" c="dimmed">
                {acceptedCount > 0 ? (
                  <Trans>
                    {acceptedCount} of {totalFound} accepted
                  </Trans>
                ) : (
                  <Trans>{totalFound} suggestions — accept individually or apply all</Trans>
                )}
              </Text>
              <Group gap="xs">
                {acceptedCount > 0 && (
                  <Button
                    size="xs"
                    variant="light"
                    color="teal"
                    leftSection={<IconCheck size={13} />}
                    loading={enrichment.isApplying}
                    onClick={handleApplyAccepted}
                  >
                    <Trans>Apply accepted ({acceptedCount})</Trans>
                  </Button>
                )}
                <Button
                  size="xs"
                  variant="filled"
                  color="violet"
                  leftSection={<IconSparkles size={13} />}
                  loading={enrichment.isApplying}
                  onClick={handleApplyAll}
                >
                  <Trans>Apply all ({totalFound})</Trans>
                </Button>
              </Group>
            </Group>
          </>
        )}

        {allDone && totalFound === 0 && (
          <Group justify="flex-end">
            <Button size="xs" variant="subtle" color="gray" onClick={handleClose}>
              <Trans>Close</Trans>
            </Button>
          </Group>
        )}
      </Stack>
    </Modal>
  );
}
