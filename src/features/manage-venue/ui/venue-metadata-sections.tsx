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
  MultiSelect,
  NumberInput,
  Paper,
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
import { IconAlertCircle, IconAlertTriangle, IconCheck, IconChevronRight, IconPencil, IconSparkles, IconX } from "@tabler/icons-react";
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
import type { VenueEnrichmentSuggestion } from "@/entities/venue";
import { SECTION_CARD_STYLES } from "./section-accent";

// ── AI suggestion chip (inline, per-field) ────────────────────────────────────

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

/** Render a metadata value as text input content; non-primitives render empty. */
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

// ── Section editor (drawer body) ──────────────────────────────────────────────

interface SectionFieldsFormProps {
  venueId: string;
  metadata: MetadataDocument;
  fields: MetadataFieldDefinition[];
  sectionLabel: string;
  onClose: () => void;
}

/**
 * Edit drawer body for a single metadata section. Keeps a local draft, and on
 * apply sends only the changed fields merged into one PATCH. Stays open on
 * failure so the draft is not lost.
 */
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

// ── Section card ──────────────────────────────────────────────────────────────

function MetadataSectionCard({
  venueId,
  metadata,
  section,
  suggestions,
  onAcceptSuggestion,
  onDismissSuggestion,
}: {
  venueId: string;
  metadata: MetadataDocument;
  section: MetadataSectionDefinition;
  suggestions: VenueEnrichmentSuggestion[];
  onAcceptSuggestion: (s: VenueEnrichmentSuggestion) => void;
  onDismissSuggestion: (s: VenueEnrichmentSuggestion) => void;
}) {
  const { t } = useLingui();
  const [opened, setOpened] = useState(false);

  const editable = section.fields.filter((field) => !field.readOnly);
  const readOnly = section.fields.filter((field) => field.readOnly);
  const valueFields = editable.filter((field) => field.type !== "boolean");
  const boolFields = editable.filter((field) => field.type === "boolean");

  const { filled, total } = sectionCompleteness(section.fields, metadata);
  const allFilled = total > 0 && filled === total;

  const hasAny =
    filled > 0 || readOnly.some((field) => !isFieldEmpty(resolveFieldValue(metadata, field)));

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

            {!hasAny && suggestions.length === 0 ? (
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
              </Stack>
            )}          </Stack>

          {editable.length > 0 && (
            <Tooltip label={t`Edit ${section.label}`} withArrow position="left">
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                style={{ flexShrink: 0 }}
                onClick={() => setOpened(true)}
              >
                <IconPencil size={14} />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </Paper>

      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
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
          onClose={() => setOpened(false)}
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
  suggestions?: VenueEnrichmentSuggestion[];
  onAcceptSuggestion?: (s: VenueEnrichmentSuggestion) => void;
  onDismissSuggestion?: (s: VenueEnrichmentSuggestion) => void;
}

/**
 * Structured view of the venue metadata document — one card per spec section,
 * grouped under tab dividers, each editable through a right-anchored drawer.
 * When AI enrichment suggestions are active they are threaded down to each
 * matching section card as inline diff chips.
 */
export function VenueMetadataSections({
  venueId,
  metadata,
  isLoading,
  suggestions = [],
  onAcceptSuggestion,
  onDismissSuggestion,
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
                suggestions={suggestions.filter(
                  (s) =>
                    section.fields.some(
                      (f) => f.key === `${s.group}.${s.field}` || f.key === s.field,
                    ),
                )}
                onAcceptSuggestion={onAcceptSuggestion ?? (() => {})}
                onDismissSuggestion={onDismissSuggestion ?? (() => {})}
              />
            ))}
          </Stack>
        );
      })}
    </Stack>
  );
}
