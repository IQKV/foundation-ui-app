import { useMemo, useState } from "react";
import {
  ActionIcon,
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Loader,
  MultiSelect,
  NumberInput,
  Paper,
  Popover,
  Select,
  Skeleton,
  Stack,
  Switch,
  TagsInput,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconCheck,
  IconPencil,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  isFieldEmpty,
  parseMetadata,
  resolveFieldValue,
  sectionCompleteness,
  METADATA_SECTIONS,
  METADATA_TABS,
  useUpdateVenueMetadata,
} from "../model";
import type {
  MetadataDocument,
  MetadataFieldDefinition,
  MetadataSectionDefinition,
} from "../model";
import type { VenueEnrichmentSuggestion, VenueTextContent } from "@/entities/venue";
import type { FieldExtractResult, UseVenueEnrichmentResult } from "../model";
import { SECTION_CARD_STYLES } from "./section-accent";

// ── AI suggestion chip (inline, per-field, from chat flow) ───────────────────

function SuggestionChip({
  suggestion,
  onAccept,
  onDismiss,
}: {
  suggestion: VenueEnrichmentSuggestion;
  onAccept: () => void;
  onDismiss: () => void;
}) {
  return (
    <Group
      gap={6}
      wrap="nowrap"
      mt={2}
      px={8}
      py={4}
      style={{
        borderRadius: "var(--mantine-radius-sm)",
        background: "var(--mantine-color-violet-0)",
        border: "1px solid var(--mantine-color-violet-3)",
      }}
    >
      <IconSparkles size={11} color="var(--mantine-color-violet-6)" style={{ flexShrink: 0 }} />
      <Text size="xs" c="violet" fw={500} style={{ flex: 1, minWidth: 0, wordBreak: "break-word" }}>
        {suggestion.value}
      </Text>
      <ActionIcon size="xs" variant="subtle" color="teal" aria-label="Accept" onClick={onAccept}>
        <IconCheck size={11} />
      </ActionIcon>
      <ActionIcon size="xs" variant="subtle" color="gray" aria-label="Dismiss" onClick={onDismiss}>
        <IconX size={11} />
      </ActionIcon>
    </Group>
  );
}

// ── Extract result chip (per-section extraction flow) ────────────────────────

function ExtractResultChip({
  result,
  onAccept,
  onSkip,
}: {
  result: FieldExtractResult;
  onAccept: () => void;
  onSkip: () => void;
}) {
  const fieldDef = METADATA_SECTIONS.flatMap((s) => s.fields).find(
    (f) => f.key === `${result.group}.${result.field}` || f.key === result.field,
  );
  const label = fieldDef?.label ?? `${result.group} / ${result.field}`;

  return (
    <Paper
      withBorder
      px="sm"
      py={6}
      radius="sm"
      style={{
        borderColor: "var(--mantine-color-violet-3)",
        background: "var(--mantine-color-violet-0)",
      }}
    >
      <Stack gap={4}>
        <Group justify="space-between" wrap="nowrap" gap="xs">
          <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
            <Group gap={5} wrap="nowrap">
              <IconSparkles
                size={11}
                color="var(--mantine-color-violet-6)"
                style={{ flexShrink: 0 }}
              />
              <Text size="xs" c="dimmed" style={{ flexShrink: 0 }}>
                {label}
              </Text>
            </Group>
            <Text size="sm" fw={600} c="violet.8" style={{ wordBreak: "break-word" }}>
              {result.value}
            </Text>
          </Stack>
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
        </Group>
        {result.evidence && (
          <Text
            size="xs"
            c="dimmed"
            fs="italic"
            style={{
              borderLeft: "2px solid var(--mantine-color-violet-3)",
              paddingLeft: 6,
              wordBreak: "break-word",
            }}
          >
            "{result.evidence}"
          </Text>
        )}
      </Stack>
    </Paper>
  );
}

// ── Field chips ───────────────────────────────────────────────────────────────

function formatFieldValue(definition: MetadataFieldDefinition, value: unknown): string | null {
  if (isFieldEmpty(value)) return null;
  if (definition.type === "enum") {
    const match = definition.options?.find((option) => option.value === value);
    return match?.label ?? String(value);
  }
  if (definition.type === "enum_multi") {
    const list = Array.isArray(value) ? value : [];
    return list
      .map(
        (item) =>
          definition.options?.find((option) => option.value === item)?.label ?? String(item),
      )
      .join(", ");
  }
  if (Array.isArray(value)) {
    const primitives = value.filter((item) => typeof item === "string" || typeof item === "number");
    if (primitives.length > 0) return primitives.join(", ");
    return `${value.length} entries`;
  }
  if (definition.unit) return `${String(value)} ${definition.unit}`;
  return String(value);
}

function ValueChip({ definition, value }: { definition: MetadataFieldDefinition; value: unknown }) {
  const text = formatFieldValue(definition, value);
  return (
    <Group gap={4} wrap="nowrap" style={{ minWidth: 0 }}>
      <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
        {definition.label}:
      </Text>
      {text === null ? (
        <Text size="sm" c="dimmed" fs="italic">
          —
        </Text>
      ) : (
        <Text size="sm" style={{ wordBreak: "break-word" }}>
          {text}
        </Text>
      )}
    </Group>
  );
}

function BooleanChip({
  definition,
  value,
}: {
  definition: MetadataFieldDefinition;
  value: unknown;
}) {
  const on = Boolean(value);
  return (
    <Group gap={4} wrap="nowrap">
      <ThemeIcon size={16} radius="xl" variant="light" color={on ? "teal" : "gray"}>
        {on ? <IconCheck size={10} /> : <IconAlertTriangle size={10} />}
      </ThemeIcon>
      <Text size="sm" c={on ? undefined : "dimmed"}>
        {definition.label}
      </Text>
    </Group>
  );
}

// ── Single-field input ────────────────────────────────────────────────────────

function toInputText(value: unknown): string {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return "";
}

function FieldInput({
  definition,
  value,
  onChange,
}: {
  definition: MetadataFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { type, label, placeholder, unit, min, max, options, hint } = definition;
  const inputLabel = unit ? `${label} (${unit})` : label;

  if (type === "boolean") {
    return (
      <Group justify="space-between" py={4} wrap="nowrap">
        <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
          <Text size="sm" fw={500}>
            {label}
          </Text>
          {hint && (
            <Text size="xs" c="dimmed">
              {hint}
            </Text>
          )}
        </Stack>
        <Switch checked={Boolean(value)} onChange={(e) => onChange(e.currentTarget.checked)} />
      </Group>
    );
  }

  if (type === "enum") {
    return (
      <Select
        label={inputLabel}
        description={hint}
        data={options?.map((option) => ({ value: option.value, label: option.label })) ?? []}
        value={value != null ? toInputText(value) : null}
        onChange={(next) => onChange(next)}
        placeholder={placeholder ?? "Select…"}
        clearable
      />
    );
  }

  if (type === "enum_multi") {
    return (
      <MultiSelect
        label={inputLabel}
        description={hint}
        data={options?.map((option) => ({ value: option.value, label: option.label })) ?? []}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(next) => onChange(next)}
        placeholder={placeholder ?? "Select…"}
      />
    );
  }

  if (type === "string_array") {
    return (
      <TagsInput
        label={inputLabel}
        description={hint}
        value={Array.isArray(value) ? (value as string[]) : []}
        onChange={(next) => onChange(next)}
        placeholder={placeholder ?? "Type and press Enter…"}
        splitChars={[","]}
      />
    );
  }

  if (type === "integer" || type === "decimal") {
    return (
      <NumberInput
        label={inputLabel}
        description={hint}
        value={value != null ? Number(value) : ""}
        onChange={(next) => onChange(next === "" ? null : Number(next))}
        placeholder={placeholder ?? ""}
        min={min}
        max={max}
        allowDecimal={type === "decimal"}
        decimalScale={type === "decimal" ? 2 : undefined}
      />
    );
  }

  if (type === "time") {
    return (
      <TextInput
        label={inputLabel}
        description={hint}
        value={toInputText(value)}
        onChange={(e) => onChange(e.currentTarget.value || null)}
        placeholder={placeholder ?? "23:00"}
        maxLength={5}
      />
    );
  }

  if (hint) {
    return (
      <Textarea
        label={inputLabel}
        description={hint}
        value={toInputText(value)}
        onChange={(e) => onChange(e.currentTarget.value || null)}
        placeholder={placeholder}
        minRows={2}
        autosize
        maxRows={5}
      />
    );
  }

  return (
    <TextInput
      label={inputLabel}
      description={hint}
      value={toInputText(value)}
      onChange={(e) => onChange(e.currentTarget.value || null)}
      placeholder={placeholder}
    />
  );
}

// ── Section editor drawer ─────────────────────────────────────────────────────

interface SectionFieldsFormProps {
  venueId: string;
  metadata: MetadataDocument;
  fields: MetadataFieldDefinition[];
  sectionLabel: string;
  onClose: () => void;
}

function SectionFieldsForm({
  venueId,
  metadata,
  fields,
  sectionLabel,
  onClose,
}: SectionFieldsFormProps) {
  const { t } = useLingui();
  const mutation = useUpdateVenueMetadata({ venueId, sectionLabel, onSuccess: onClose });

  const [draft, setDraft] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of fields) {
      initial[field.key] = resolveFieldValue(metadata, field) ?? null;
    }
    return initial;
  });

  function handleChange(key: string, value: unknown) {
    setDraft((prev) => ({ ...prev, [key]: value }));
  }

  function handleApply() {
    const changes = fields
      .filter(
        (field) =>
          JSON.stringify(resolveFieldValue(metadata, field) ?? null) !==
          JSON.stringify(draft[field.key] ?? null),
      )
      .map((field) => ({ field, value: draft[field.key] ?? null }));

    if (changes.length === 0) {
      onClose();
      return;
    }
    mutation.mutate({ base: metadata, changes });
  }

  return (
    <Stack gap="md" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Stack gap="sm" style={{ flex: 1, overflowY: "auto" }}>
        {fields.map((field, index) => {
          const previous = fields[index - 1];
          const showDivider = index > 0 && field.type === "boolean" && previous?.type !== "boolean";
          return (
            <div key={field.key}>
              {showDivider && <Divider my={4} />}
              <FieldInput
                definition={field}
                value={draft[field.key]}
                onChange={(value) => handleChange(field.key, value)}
              />
            </div>
          );
        })}
      </Stack>

      {mutation.isError && (
        <Alert icon={<IconAlertCircle size={14} />} color="red" variant="light" radius="sm">
          <Text size="xs">
            <Trans>Some fields could not be saved. Please try again.</Trans>
          </Text>
        </Alert>
      )}

      <Divider />
      <Group justify="flex-end" gap="sm">
        <Button variant="subtle" color="gray" onClick={onClose} disabled={mutation.isPending}>
          <Trans>Cancel</Trans>
        </Button>
        <Button loading={mutation.isPending} onClick={handleApply}>
          {t`Apply`}
        </Button>
      </Group>
    </Stack>
  );
}

// ── Source picker popover (extract trigger) ───────────────────────────────────

function ExtractPopover({
  section,
  sources,
  enrichment,
  metadata,
  onResults,
}: {
  section: MetadataSectionDefinition;
  sources: VenueTextContent[];
  enrichment: UseVenueEnrichmentResult;
  metadata: MetadataDocument;
  onResults: (results: FieldExtractResult[]) => void;
}) {
  const { t } = useLingui();
  const [opened, setOpened] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  // Prefer the venue text row's own label (title / file name); fall back to a content snippet.
  const sourceOptions = sources.map((s) => {
    const label = s.label?.trim() || s.content.trim().replace(/\s+/g, " ");
    return { value: s.id, label: label.slice(0, 60) + (label.length > 60 ? "…" : "") };
  });

  async function handleExtract() {
    if (!sourceId) return;
    setRunning(true);
    setProgress(null);
    const collected: FieldExtractResult[] = [];

    // Serialise current metadata back to JSON for the hook.
    const rawMeta = JSON.stringify(metadata);

    await enrichment.extractSection(section.key, sourceId, rawMeta, (result, fieldKey, done) => {
      const def = section.fields.find((f) => f.key === fieldKey);
      setProgress(def?.label ?? fieldKey);
      if (result) collected.push(result);
      if (done) {
        setRunning(false);
        setProgress(null);
        setOpened(false);
        onResults(collected);
      }
    });
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="left-start"
      withArrow
      shadow="md"
      width={280}
    >
      <Popover.Target>
        <Tooltip label={t`Fill with AI`} withArrow position="left">
          <ActionIcon
            variant="subtle"
            color="violet"
            size="sm"
            style={{ flexShrink: 0 }}
            onClick={() => setOpened((o) => !o)}
            aria-label={t`Fill section with AI`}
          >
            <IconSparkles size={14} />
          </ActionIcon>
        </Tooltip>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap="sm">
          <Group gap={6} wrap="nowrap">
            <IconSparkles size={13} color="var(--mantine-color-violet-6)" />
            <Text size="sm" fw={600}>
              <Trans>Fill with AI</Trans>
            </Text>
          </Group>
          <Select
            size="xs"
            label={t`Source document`}
            placeholder={t`Pick a source…`}
            data={sourceOptions}
            value={sourceId}
            onChange={setSourceId}
            disabled={running}
            comboboxProps={{ withinPortal: false }}
          />
          {running && progress && (
            <Group gap={6} wrap="nowrap">
              <Loader size="xs" color="violet" />
              <Text size="xs" c="dimmed" lineClamp={1}>
                {progress}
              </Text>
            </Group>
          )}
          <Button
            size="xs"
            variant="light"
            color="violet"
            leftSection={running ? <Loader size={12} color="violet" /> : <IconSparkles size={13} />}
            disabled={!sourceId || running}
            onClick={() => void handleExtract()}
            fullWidth
          >
            {running ? <Trans>Extracting…</Trans> : <Trans>Extract</Trans>}
          </Button>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}

// ── Section card ──────────────────────────────────────────────────────────────

function MetadataSectionCard({
  venueId,
  metadata,
  section,
  sources,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
  enrichment,
  onAcceptExtracted,
}: {
  venueId: string;
  metadata: MetadataDocument;
  section: MetadataSectionDefinition;
  sources: VenueTextContent[];
  suggestions: VenueEnrichmentSuggestion[];
  onAcceptSuggestion: (s: VenueEnrichmentSuggestion) => void;
  onDismissSuggestion: (s: VenueEnrichmentSuggestion) => void;
  enrichment: UseVenueEnrichmentResult;
  onAcceptExtracted: (results: VenueEnrichmentSuggestion[]) => void;
}) {
  const { t } = useLingui();
  const [drawerOpened, setDrawerOpened] = useState(false);
  // Pending extract results for this section.
  const [extractResults, setExtractResults] = useState<FieldExtractResult[]>([]);

  const editable = section.fields.filter((field) => !field.readOnly);
  const readOnly = section.fields.filter((field) => field.readOnly);
  const valueFields = editable.filter((field) => field.type !== "boolean");
  const boolFields = editable.filter((field) => field.type === "boolean");

  const { filled, total } = sectionCompleteness(section.fields, metadata);
  const allFilled = total > 0 && filled === total;
  const hasEmptyFields = filled < total;

  const hasAny =
    filled > 0 || readOnly.some((field) => !isFieldEmpty(resolveFieldValue(metadata, field)));

  function handleExtractResults(results: FieldExtractResult[]) {
    // Merge: replace any existing result for the same field.
    setExtractResults((prev) => {
      const next = [...prev];
      for (const r of results) {
        const idx = next.findIndex((x) => x.group === r.group && x.field === r.field);
        if (idx >= 0) {
          next[idx] = r;
        } else {
          next.push(r);
        }
      }
      return next;
    });
  }

  function dismissExtractResult(r: FieldExtractResult) {
    setExtractResults((prev) => prev.filter((x) => !(x.group === r.group && x.field === r.field)));
  }

  function acceptExtractResult(r: FieldExtractResult) {
    onAcceptExtracted([{ group: r.group, field: r.field, value: r.value }]);
    dismissExtractResult(r);
  }

  return (
    <>
      <Paper withBorder radius="md" p="lg" shadow="sm" styles={SECTION_CARD_STYLES}>
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={8} align="center">
              <Text size="md" fw={700}>
                {section.label}
              </Text>
              {total > 0 && (
                <Badge
                  variant="light"
                  color={allFilled ? "teal" : "gray"}
                  size="xs"
                  leftSection={
                    allFilled ? (
                      <IconCheck size={10} style={{ marginTop: 1 }} />
                    ) : (
                      <IconAlertTriangle size={10} style={{ marginTop: 1 }} />
                    )
                  }
                >
                  {filled}/{total}
                </Badge>
              )}
            </Group>

            {!hasAny && suggestions.length === 0 && extractResults.length === 0 ? (
              <Text size="xs" c="dimmed" fs="italic">
                <Trans>No data yet — click Edit to add.</Trans>
              </Text>
            ) : (
              <Stack gap={6}>
                {valueFields.length > 0 && (
                  <Group gap="lg" wrap="wrap">
                    {valueFields.map((field) => (
                      <ValueChip
                        key={field.key}
                        definition={field}
                        value={resolveFieldValue(metadata, field)}
                      />
                    ))}
                  </Group>
                )}
                {boolFields.length > 0 && (
                  <Group gap="sm" wrap="wrap">
                    {boolFields.map((field) => (
                      <BooleanChip
                        key={field.key}
                        definition={field}
                        value={resolveFieldValue(metadata, field)}
                      />
                    ))}
                  </Group>
                )}
                {readOnly.length > 0 && (
                  <Box>
                    {readOnly.map((field) => (
                      <ValueChip
                        key={field.key}
                        definition={field}
                        value={resolveFieldValue(metadata, field)}
                      />
                    ))}
                  </Box>
                )}
                {/* Chat-flow suggestion chips */}
                {suggestions.length > 0 && (
                  <Stack gap={4} mt={4}>
                    {suggestions.map((s) => (
                      <SuggestionChip
                        key={`${s.group}.${s.field}`}
                        suggestion={s}
                        onAccept={() => onAcceptSuggestion(s)}
                        onDismiss={() => onDismissSuggestion(s)}
                      />
                    ))}
                  </Stack>
                )}
                {/* Per-section extract result chips */}
                {extractResults.length > 0 && (
                  <Stack gap={4} mt={4}>
                    {extractResults.map((r) => (
                      <ExtractResultChip
                        key={`${r.group}.${r.field}`}
                        result={r}
                        onAccept={() => acceptExtractResult(r)}
                        onSkip={() => dismissExtractResult(r)}
                      />
                    ))}
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>

          <Group gap={4} style={{ flexShrink: 0 }}>
            {/* AI extract button — only shown when sources exist and section has empty fields */}
            {sources.length > 0 && hasEmptyFields && editable.length > 0 && (
              <ExtractPopover
                section={section}
                sources={sources}
                enrichment={enrichment}
                metadata={metadata}
                onResults={handleExtractResults}
              />
            )}
            {editable.length > 0 && (
              <Tooltip label={t`Edit ${section.label}`} withArrow position="left">
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  style={{ flexShrink: 0 }}
                  onClick={() => setDrawerOpened(true)}
                >
                  <IconPencil size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Group>
      </Paper>

      <Drawer
        opened={drawerOpened}
        onClose={() => setDrawerOpened(false)}
        position="right"
        size="md"
        title={
          <Text fw={600} size="sm">
            <Trans>Edit — {section.label}</Trans>
          </Text>
        }
        padding="lg"
        styles={{
          body: {
            display: "flex",
            flexDirection: "column",
            height: "calc(100% - 60px)",
            overflow: "hidden",
          },
        }}
      >
        <SectionFieldsForm
          venueId={venueId}
          metadata={metadata}
          fields={editable}
          sectionLabel={section.label}
          onClose={() => setDrawerOpened(false)}
        />
      </Drawer>
    </>
  );
}

// ── Entry component ───────────────────────────────────────────────────────────

interface VenueMetadataSectionsProps {
  venueId: string;
  metadata: string | null;
  isLoading?: boolean;
  sources?: VenueTextContent[];
  suggestions?: VenueEnrichmentSuggestion[];
  onAcceptSuggestion?: (s: VenueEnrichmentSuggestion) => void;
  onDismissSuggestion?: (s: VenueEnrichmentSuggestion) => void;
  enrichment?: UseVenueEnrichmentResult;
}

/**
 * Structured view of the venue metadata document — one card per spec section,
 * grouped under tab dividers, each editable through a right-anchored drawer.
 *
 * When the venue has preloaded source documents, each section card with empty
 * fields shows a sparkle button that opens a source picker popover. Selecting
 * a source and clicking Extract runs the per-field extraction endpoint for all
 * empty fields in that section; each result appears as an evidence-backed chip
 * the user accepts or skips individually.
 *
 * Chat-flow AI suggestion patches are threaded down as before when present.
 */
export function VenueMetadataSections({
  venueId,
  metadata,
  isLoading,
  sources = [],
  suggestions = [],
  onAcceptSuggestion,
  onDismissSuggestion,
  enrichment,
}: VenueMetadataSectionsProps) {
  const parsed = useMemo(() => parseMetadata(metadata), [metadata]);

  if (isLoading) {
    return (
      <Stack gap="sm">
        {[140, 110, 110].map((height, index) => (
          <Skeleton key={index} height={height} radius="md" />
        ))}
      </Stack>
    );
  }

  if (parsed === null) {
    return (
      <Alert icon={<IconAlertCircle size={16} />} color="orange" variant="light" radius="md">
        <Trans>
          Metadata is not a supported document — section editing is disabled. Use the raw viewer
          below.
        </Trans>
      </Alert>
    );
  }

  return (
    <Stack gap="xs">
      {METADATA_TABS.map((tab) => {
        const sections = METADATA_SECTIONS.filter((section) => section.tab === tab.key).sort(
          (a, b) => a.order - b.order,
        );
        if (sections.length === 0) return null;
        return (
          <Stack key={tab.key} gap="sm">
            <Divider
              label={
                <Text
                  size="xs"
                  fw={700}
                  tt="uppercase"
                  c="dimmed"
                  style={{ letterSpacing: "0.07em" }}
                >
                  {tab.label}
                </Text>
              }
              labelPosition="left"
              my="xs"
            />
            {sections.map((section) => (
              <MetadataSectionCard
                key={section.key}
                venueId={venueId}
                metadata={parsed}
                section={section}
                sources={sources}
                suggestions={suggestions.filter((s) =>
                  section.fields.some(
                    (f) => f.key === `${s.group}.${s.field}` || f.key === s.field,
                  ),
                )}
                onAcceptSuggestion={onAcceptSuggestion ?? (() => {})}
                onDismissSuggestion={onDismissSuggestion ?? (() => {})}
                enrichment={enrichment ?? ({} as UseVenueEnrichmentResult)}
                onAcceptExtracted={(patches) => {
                  if (enrichment && patches.length > 0) {
                    enrichment.applyPatches(patches, metadata);
                  }
                }}
              />
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}
