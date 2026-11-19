import { useMemo, useState } from "react";
import type { ReactNode } from "react";
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
  SimpleGrid,
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
  IconPlus,
  IconSparkles,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import {
  isAutoFillEligible,
  isFieldEmpty,
  parseMetadata,
  resolveFieldValue,
  sectionCompleteness,
  METADATA_CARD_GROUPS,
  METADATA_SECTIONS,
  useUpdateVenueMetadata,
} from "../model";
import type {
  MetadataDocument,
  MetadataFieldDefinition,
  MetadataRecordFieldDefinition,
  MetadataSectionDefinition,
} from "../model";
import type { Venue, VenueEnrichmentSuggestion, VenueTextContent } from "@/entities/venue";
import type { FieldExtractResult, UseVenueEnrichmentResult } from "../model";
import { TestSelectors } from "@/shared/lib/test-selectors";

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
  if (definition.type === "contacts") {
    const rows = Array.isArray(value) ? value : [];
    const labels = rows
      .map((row) => {
        if (row !== null && typeof row === "object") {
          const record = row as Record<string, unknown>;
          const name = typeof record.name === "string" ? record.name : "";
          const role = typeof record.role === "string" ? record.role : "";
          if (name && role) return `${name} (${role})`;
          return name || role;
        }
        return String(row);
      })
      .filter((label) => label !== "");
    return labels.length > 0 ? labels.join(", ") : null;
  }
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
    <Stack gap={3} style={{ minWidth: 0 }}>
      <Text
        size="xs"
        c="var(--mantine-color-text)"
        fw={500}
        tt="uppercase"
        style={{ letterSpacing: "0.07em" }}
      >
        {definition.label}
      </Text>
      {text === null ? (
        <Text size="sm" c="dimmed">
          —
        </Text>
      ) : (
        <Text
          size="sm"
          c="var(--mantine-color-text)"
          fw={600}
          style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
        >
          {text}
        </Text>
      )}
    </Stack>
  );
}

function RecordArrayValue({
  definition,
  value,
}: {
  definition: MetadataFieldDefinition;
  value: unknown;
}) {
  const rows = Array.isArray(value)
    ? value.filter((row): row is Record<string, unknown> => row !== null && typeof row === "object")
    : [];
  const fields = definition.recordFields ?? [];

  return (
    <Stack gap="xs">
      <Text
        size="xs"
        c="var(--mantine-color-text)"
        fw={500}
        tt="uppercase"
        style={{ letterSpacing: "0.07em" }}
      >
        {definition.label}
      </Text>
      {rows.length === 0 ? (
        <Text size="sm" c="dimmed">
          —
        </Text>
      ) : (
        <Stack gap={6}>
          {rows.map((row, index) => (
            <Paper key={index} withBorder radius="sm" p="xs">
              <SimpleGrid cols={{ base: 1, sm: Math.min(fields.length, 4) }} spacing="xs">
                {fields.map((field) => (
                  <Stack key={field.key} gap={2} style={{ minWidth: 0 }}>
                    <Text size="xs" c="var(--mantine-color-text)" fw={500}>
                      {field.label}
                    </Text>
                    <Text
                      size="sm"
                      c="var(--mantine-color-text)"
                      fw={600}
                      style={{ wordBreak: "break-word" }}
                    >
                      {row[field.key] == null || row[field.key] === ""
                        ? "—"
                        : String(row[field.key])}
                      {row[field.key] != null && row[field.key] !== "" && field.unit
                        ? ` ${field.unit}`
                        : ""}
                    </Text>
                  </Stack>
                ))}
              </SimpleGrid>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}

function CoreVenueValue({
  label,
  value,
  fullWidth = false,
  testId,
}: {
  label: ReactNode;
  value: string | null;
  fullWidth?: boolean;
  testId?: string;
}) {
  return (
    <Stack gap={3} style={{ minWidth: 0, gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <Text
        size="xs"
        c="var(--mantine-color-text)"
        fw={500}
        tt="uppercase"
        style={{ letterSpacing: "0.07em" }}
      >
        {label}
      </Text>
      <Text
        size="sm"
        c="var(--mantine-color-text)"
        fw={600}
        data-testid={testId}
        style={{ wordBreak: "break-word", whiteSpace: "pre-line" }}
      >
        {value?.trim() || "—"}
      </Text>
    </Stack>
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

interface ContactEntry {
  name: string;
  role: string;
}

/** Normalise the stored `{name, role}` rows into editable pairs. */
function toContactEntries(value: unknown): ContactEntry[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    if (row !== null && typeof row === "object") {
      const record = row as Record<string, unknown>;
      return {
        name: typeof record.name === "string" ? record.name : "",
        role: typeof record.role === "string" ? record.role : "",
      };
    }
    return { name: typeof row === "string" ? row : "", role: "" };
  });
}

/** Repeatable name + role editor for the structured `contacts` field. */
function ContactsEditor({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { t } = useLingui();
  const [rows, setRows] = useState<ContactEntry[]>(() => {
    const initial = toContactEntries(value);
    return initial.length > 0 ? initial : [{ name: "", role: "" }];
  });

  // Persist only complete rows; an empty draft row stays local until it is filled.
  function emit(next: ContactEntry[]) {
    setRows(next);
    const cleaned = next
      .map((row) => ({ name: row.name.trim(), role: row.role.trim() }))
      .filter((row) => row.name !== "" || row.role !== "");
    onChange(cleaned.length > 0 ? cleaned : null);
  }

  function updateRow(index: number, patch: Partial<ContactEntry>) {
    emit(rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  }

  return (
    <Stack gap="xs">
      <Stack gap={0}>
        <Text size="sm" fw={500}>
          {label}
        </Text>
        {hint && (
          <Text size="xs" c="dimmed">
            {hint}
          </Text>
        )}
      </Stack>
      {rows.map((row, index) => (
        <Group key={index} gap="xs" wrap="nowrap" align="flex-end">
          <TextInput
            style={{ flex: 1 }}
            placeholder={t`Name`}
            value={row.name}
            onChange={(event) => updateRow(index, { name: event.currentTarget.value })}
          />
          <TextInput
            style={{ flex: 1 }}
            placeholder={t`Role`}
            value={row.role}
            onChange={(event) => updateRow(index, { role: event.currentTarget.value })}
          />
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={t`Remove contact`}
            onClick={() => emit(rows.filter((_, i) => i !== index))}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        variant="light"
        size="xs"
        style={{ alignSelf: "flex-start" }}
        leftSection={<IconPlus size={14} />}
        onClick={() => setRows((prev) => [...prev, { name: "", role: "" }])}
      >
        <Trans>Add contact</Trans>
      </Button>
    </Stack>
  );
}

type RecordDraft = Record<string, string | number>;

function toRecordDrafts(value: unknown, fields: MetadataRecordFieldDefinition[]): RecordDraft[] {
  if (!Array.isArray(value)) return [];
  return value.map((row) => {
    const record = row !== null && typeof row === "object" ? (row as Record<string, unknown>) : {};
    return Object.fromEntries(
      fields.map((field) => [field.key, (record[field.key] as string | number | undefined) ?? ""]),
    );
  });
}

function RecordArrayEditor({
  definition,
  value,
  onChange,
}: {
  definition: MetadataFieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const { t } = useLingui();
  const fields = definition.recordFields ?? [];
  const [rows, setRows] = useState<RecordDraft[]>(() => {
    const initial = toRecordDrafts(value, fields);
    return initial.length > 0
      ? initial
      : [Object.fromEntries(fields.map((field) => [field.key, ""]))];
  });

  function emit(next: RecordDraft[]) {
    setRows(next);
    const cleaned = next
      .map((row) => {
        const record: Record<string, unknown> = {};
        for (const field of fields) {
          const raw = row[field.key];
          if (raw == null || String(raw).trim() === "") continue;
          record[field.key] =
            field.type === "integer" || field.type === "decimal" ? Number(raw) : String(raw).trim();
        }
        return record;
      })
      .filter((row) => Object.keys(row).length > 0);
    onChange(cleaned.length > 0 ? cleaned : null);
  }

  function updateRow(index: number, key: string, value: string | number) {
    emit(rows.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  return (
    <Stack gap="xs">
      <Stack gap={0}>
        <Text size="sm" fw={500}>
          {definition.label}
        </Text>
        {definition.hint && (
          <Text size="xs" c="dimmed">
            {definition.hint}
          </Text>
        )}
      </Stack>
      {rows.map((row, index) => (
        <Group key={index} gap="xs" wrap="nowrap" align="flex-end">
          <SimpleGrid cols={{ base: 1, sm: fields.length }} spacing="xs" style={{ flex: 1 }}>
            {fields.map((field) =>
              field.type === "integer" || field.type === "decimal" ? (
                <NumberInput
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={row[field.key] ?? ""}
                  allowDecimal={field.type === "decimal"}
                  decimalScale={field.type === "decimal" ? 2 : undefined}
                  onChange={(value) =>
                    updateRow(index, field.key, value === "" ? "" : Number(value))
                  }
                />
              ) : (
                <TextInput
                  key={field.key}
                  label={field.label}
                  placeholder={field.placeholder}
                  value={row[field.key] ?? ""}
                  onChange={(event) => updateRow(index, field.key, event.currentTarget.value)}
                />
              ),
            )}
          </SimpleGrid>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label={t`Remove row`}
            onClick={() => emit(rows.filter((_, rowIndex) => rowIndex !== index))}
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      ))}
      <Button
        variant="light"
        size="xs"
        style={{ alignSelf: "flex-start" }}
        leftSection={<IconPlus size={14} />}
        onClick={() =>
          setRows((previous) => [
            ...previous,
            Object.fromEntries(fields.map((field) => [field.key, ""])),
          ])
        }
      >
        {definition.addLabel ?? t`Add row`}
      </Button>
    </Stack>
  );
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

  if (type === "contacts") {
    return <ContactsEditor label={label} hint={hint} value={value} onChange={onChange} />;
  }

  if (type === "record_array") {
    return <RecordArrayEditor definition={definition} value={value} onChange={onChange} />;
  }
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
  isFirst,
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
  isFirst: boolean;
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
  // Structured fields (e.g. contacts) are edited manually, never by the scalar AI extractor.
  const autoFillFields = editable.filter(isAutoFillEligible);

  const { filled, total } = sectionCompleteness(section.fields, metadata);
  const allFilled = total > 0 && filled === total;
  const hasAutoFillGap = autoFillFields.some((field) =>
    isFieldEmpty(resolveFieldValue(metadata, field)),
  );

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
      <Box>
        {(!isFirst || section.cardGroup === "venue") && <Divider my="sm" />}
        <Group justify="space-between" align="flex-start" wrap="nowrap" gap="md">
          <Stack gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Group gap={8} align="center">
              <Text size="sm" c="dimmed" fw={500}>
                {section.subgroup ?? section.label}
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

            <Stack gap={6}>
              {valueFields.length > 0 && (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {valueFields.map((field) =>
                    field.type === "record_array" ? (
                      <Box key={field.key} style={{ gridColumn: "1 / -1" }}>
                        <RecordArrayValue
                          definition={field}
                          value={resolveFieldValue(metadata, field)}
                        />
                      </Box>
                    ) : (
                      <ValueChip
                        key={field.key}
                        definition={field}
                        value={resolveFieldValue(metadata, field)}
                      />
                    ),
                  )}
                </SimpleGrid>
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
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  {readOnly.map((field) => (
                    <ValueChip
                      key={field.key}
                      definition={field}
                      value={resolveFieldValue(metadata, field)}
                    />
                  ))}
                </SimpleGrid>
              )}
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
          </Stack>

          <Group gap={4} style={{ flexShrink: 0 }}>
            {/* AI extract button — only shown when sources exist and the section has empty, auto-fillable fields */}
            {sources.length > 0 && hasAutoFillGap && (
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
      </Box>

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
  venue?: Pick<Venue, "name" | "description" | "address" | "city">;
  isLoading?: boolean;
  sources?: VenueTextContent[];
  suggestions?: VenueEnrichmentSuggestion[];
  onAcceptSuggestion?: (s: VenueEnrichmentSuggestion) => void;
  onDismissSuggestion?: (s: VenueEnrichmentSuggestion) => void;
  enrichment?: UseVenueEnrichmentResult;
  /** Opens the manual venue edit modal from the core "The venue" card group. */
  onEdit?: () => void;
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
  venue,
  isLoading,
  sources = [],
  suggestions = [],
  onAcceptSuggestion,
  onDismissSuggestion,
  enrichment,
  onEdit,
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
    <Stack gap="md">
      {METADATA_CARD_GROUPS.map((cardGroup) => {
        const sections = METADATA_SECTIONS.filter(
          (section) => section.cardGroup === cardGroup.key,
        ).sort((a, b) => a.order - b.order);
        if (sections.length === 0) return null;
        return (
          <Paper key={cardGroup.key} withBorder radius="md" p={0}>
            <Box px="lg" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
              <Group justify="space-between" align="center" wrap="nowrap" gap="md">
                <Stack gap={4}>
                  <Text size="sm" c="dimmed" fw={500}>
                    {cardGroup.label}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {cardGroup.description}
                  </Text>
                </Stack>
                {cardGroup.key === "venue" && onEdit && (
                  <Tooltip label={<Trans>Edit Manually</Trans>} withArrow position="left">
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      size="sm"
                      style={{ flexShrink: 0 }}
                      onClick={onEdit}
                    >
                      <IconPencil size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            </Box>
            <Stack gap="md" p="lg">
              {cardGroup.key === "venue" && venue && (
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                  <CoreVenueValue
                    label={<Trans>Venue name</Trans>}
                    value={venue.name}
                    testId={TestSelectors.VENUE_DETAIL_NAME}
                  />
                  <CoreVenueValue
                    label={<Trans>City</Trans>}
                    value={venue.city}
                    testId={TestSelectors.VENUE_DETAIL_CITY}
                  />
                  <CoreVenueValue label={<Trans>Address</Trans>} value={venue.address} fullWidth />
                  <CoreVenueValue
                    label={<Trans>Overview</Trans>}
                    value={venue.description}
                    fullWidth
                  />
                </SimpleGrid>
              )}
              <Stack gap={0}>
                {sections.map((section, index) => (
                  <MetadataSectionCard
                    key={section.key}
                    venueId={venueId}
                    metadata={parsed}
                    section={section}
                    isFirst={index === 0}
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
            </Stack>
          </Paper>
        );
      })}
    </Stack>
  );
}
