import type { MetadataFieldDefinition, MetadataFieldType } from "./metadata-spec";

const DEFAULT_SCHEMA_VERSION = 1;

/** One flat metadata row: `group` is the section, `field` a dot-path within it. */
interface MetadataItem {
  group: string;
  field: string;
  value: unknown;
}

/** Canonical metadata document: a schema version plus a flat row list. */
export interface MetadataDocument {
  _schema_version: number;
  items: MetadataItem[];
}

/**
 * Parse the raw `metadata` JSON string into the canonical document.
 * Returns an empty document for empty input and `null` when the string is not
 * JSON or not the supported `{_schema_version, items}` shape (so callers can
 * block editing instead of overwriting unreadable data).
 */
export function parseMetadata(raw: string | null | undefined): MetadataDocument | null {
  if (raw == null || raw.trim() === "") {
    return { _schema_version: DEFAULT_SCHEMA_VERSION, items: [] };
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed !== null &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Array.isArray((parsed as { items?: unknown }).items)
    ) {
      const document = parsed as { _schema_version?: unknown; items: MetadataItem[] };
      return {
        _schema_version:
          typeof document._schema_version === "number"
            ? document._schema_version
            : DEFAULT_SCHEMA_VERSION,
        items: document.items,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/** Map a spec key to its row coordinates: `capacity.max_total` → group capacity / field max_total. */
function splitKey(key: string): { group: string; field: string } {
  const [group, ...rest] = key.split(".").filter(Boolean);
  return { group: group ?? key, field: rest.length > 0 ? rest.join(".") : key };
}

/** List-typed fields expand to one row per element; scalars to a single row. */
function isListField(type: MetadataFieldType): boolean {
  return type === "string_array" || type === "enum_multi";
}

/** Read a field's value from the flat rows (an array for list-typed fields). */
export function resolveFieldValue(
  metadata: MetadataDocument | null,
  definition: MetadataFieldDefinition,
): unknown {
  if (!metadata) return undefined;
  const { group, field } = splitKey(definition.key);
  const values = metadata.items
    .filter((item) => item.group === group && item.field === field)
    .map((item) => item.value);
  if (isListField(definition.type)) return values;
  return values.length > 0 ? values[0] : undefined;
}

/** `null`, `undefined`, `""` and empty arrays count as empty; `false` and `0` do not. */
export function isFieldEmpty(value: unknown): boolean {
  if (value == null || value === "") return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

/**
 * Return a copy of the document with a field written as flat rows.
 * Empty values remove the field's rows rather than storing them.
 */
export function setFieldValue(
  metadata: MetadataDocument,
  definition: MetadataFieldDefinition,
  value: unknown,
): MetadataDocument {
  const { group, field } = splitKey(definition.key);
  const values = isListField(definition.type)
    ? Array.isArray(value)
      ? value
      : []
    : isFieldEmpty(value)
      ? []
      : [value];

  const kept = metadata.items.filter((item) => !(item.group === group && item.field === field));
  const added: MetadataItem[] = values.map((item) => ({ group, field, value: item }));
  return { ...metadata, items: [...kept, ...added] };
}

/** Count of populated editable fields in a section, for the completeness badge. */
export function sectionCompleteness(
  fields: MetadataFieldDefinition[],
  metadata: MetadataDocument | null,
): { filled: number; total: number } {
  const editable = fields.filter((field) => !field.readOnly);
  const filled = editable.filter(
    (field) => !isFieldEmpty(resolveFieldValue(metadata, field)),
  ).length;
  return { filled, total: editable.length };
}
