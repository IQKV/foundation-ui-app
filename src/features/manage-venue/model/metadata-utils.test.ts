import { describe, expect, it } from "vitest";
import { METADATA_SECTIONS } from "./metadata-spec";
import type { MetadataFieldDefinition } from "./metadata-spec";
import { overallCompleteness, parseMetadata, setFieldValue } from "./metadata-utils";
import type { MetadataDocument } from "./metadata-utils";

const EMPTY: MetadataDocument = { _schema_version: 1, items: [] };

/** A value `setFieldValue` will actually store for the given field type. */
function sampleValue(field: MetadataFieldDefinition): unknown {
  if (field.type === "string_array" || field.type === "enum_multi") return ["value"];
  if (field.type === "boolean") return true;
  return "value";
}

describe("overallCompleteness", () => {
  it("reports 0% and one row per section for an empty document", () => {
    const result = overallCompleteness(parseMetadata(null));

    expect(result.filled).toBe(0);
    expect(result.percent).toBe(0);
    expect(result.total).toBeGreaterThan(0);
    expect(result.sections).toHaveLength(METADATA_SECTIONS.length);
    expect(result.sections.every((row) => row.filled === 0)).toBe(true);
  });

  it("counts only editable fields in the denominator", () => {
    const expectedTotal = METADATA_SECTIONS.reduce(
      (total, section) => total + section.fields.filter((field) => !field.readOnly).length,
      0,
    );

    expect(overallCompleteness(EMPTY).total).toBe(expectedTotal);
  });

  it("does not throw on an unreadable document", () => {
    expect(overallCompleteness(null).percent).toBe(0);
    expect(overallCompleteness(parseMetadata("{not json")).percent).toBe(0);
  });

  it("reaches 100% when every editable field is filled", () => {
    let document = EMPTY;
    for (const section of METADATA_SECTIONS) {
      for (const field of section.fields) {
        if (field.readOnly) continue;
        document = setFieldValue(document, field, sampleValue(field));
      }
    }

    const result = overallCompleteness(document);

    expect(result.filled).toBe(result.total);
    expect(result.percent).toBe(100);
    expect(result.sections.every((row) => row.filled === row.total)).toBe(true);
  });

  it("rounds the percentage and reports the filled section", () => {
    const section = METADATA_SECTIONS.find((candidate) =>
      candidate.fields.some((field) => !field.readOnly),
    );
    const field = section?.fields.find((candidate) => !candidate.readOnly);
    if (!section || !field) throw new Error("metadata spec has no editable fields");

    const result = overallCompleteness(setFieldValue(EMPTY, field, sampleValue(field)));

    expect(result.filled).toBe(1);
    expect(result.percent).toBe(Math.round((1 / result.total) * 100));
    expect(result.sections.find((row) => row.key === section.key)?.filled).toBe(1);
  });
});
