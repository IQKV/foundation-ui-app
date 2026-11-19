import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/shared/api";
import type {
  VenueEnrichmentSuggestion,
  VenueEnrichmentSuggestionResponse,
  VenueFieldExtractionResponse,
} from "@/entities/venue";
import { METADATA_SECTIONS } from "./metadata-spec";
import { isAutoFillEligible } from "./metadata-utils";

export interface EnrichmentTurn {
  message: string;
  response: VenueEnrichmentSuggestionResponse;
}

/** Pending result of a single-field extract call, held until the user accepts or skips. */
export interface FieldExtractResult {
  group: string;
  field: string;
  value: string;
  evidence: string | null;
}

export interface UseVenueEnrichmentResult {
  /** Chat history — each send appends one turn. */
  history: EnrichmentTurn[];
  /** Patches from the latest chat turn, before the user accepts/dismisses each. */
  pendingPatches: VenueEnrichmentSuggestion[];
  dismissPatch: (patch: VenueEnrichmentSuggestion) => void;
  isSuggesting: boolean;
  isApplying: boolean;
  suggestError: Error | null;
  applyError: Error | null;
  send: (message: string, fieldHint?: string) => void;
  applyPatches: (patches: VenueEnrichmentSuggestion[], currentMetadata: string | null) => void;
  reset: () => void;
  /**
   * Extract a single field from one source document.
   * Result is delivered via `onExtracted`; the caller owns the display state.
   */
  extractField: (
    group: string,
    field: string,
    sourceTextId: string,
    onExtracted: (result: FieldExtractResult | null) => void,
  ) => void;
  isExtracting: boolean;
  extractError: Error | null;
  /**
   * Run extract for all empty fields in the given section sequentially,
   * calling `onProgress` after each field resolves.
   */
  extractSection: (
    sectionKey: string,
    sourceTextId: string,
    currentMetadataRaw: string | null,
    onProgress: (result: FieldExtractResult | null, field: string, done: boolean) => void,
  ) => void;
}

export function useVenueEnrichment(venueId: string): UseVenueEnrichmentResult {
  const queryClient = useQueryClient();
  const [history, setHistory] = useState<EnrichmentTurn[]>([]);
  const [pendingPatches, setPendingPatches] = useState<VenueEnrichmentSuggestion[]>([]);

  // ── Chat / batch suggest (existing flow) ──────────────────────────────────

  const suggestMutation = useMutation({
    mutationFn: ({
      message,
      fieldHint,
      currentMetadata,
    }: {
      message: string;
      fieldHint?: string;
      currentMetadata?: string | null;
    }) =>
      catalogApi.venueEnrichmentSuggestions(venueId, {
        message,
        fieldHint: fieldHint ?? null,
        currentMetadata: currentMetadata ?? null,
      }),
    onSuccess: (response, vars) => {
      setHistory((prev) => [...prev, { message: vars.message, response }]);
      setPendingPatches(response.suggestedPatches ?? []);
    },
  });

  const applyMutation = useMutation({
    mutationFn: (patches: VenueEnrichmentSuggestion[]) =>
      catalogApi.venueEnrichmentApply(venueId, { patches }),
    onSuccess: () => {
      setPendingPatches([]);
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId] });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
    },
  });

  function send(message: string, fieldHint?: string) {
    const cached = queryClient.getQueryData<{ metadata?: string | null }>([
      "tenant",
      "venue",
      venueId,
    ]);
    suggestMutation.mutate({ message, fieldHint, currentMetadata: cached?.metadata ?? null });
  }

  function applyPatches(patches: VenueEnrichmentSuggestion[], _currentMetadata: string | null) {
    if (patches.length > 0) applyMutation.mutate(patches);
  }

  function dismissPatch(patch: VenueEnrichmentSuggestion) {
    setPendingPatches((prev) =>
      prev.filter((p) => !(p.group === patch.group && p.field === patch.field)),
    );
  }

  // ── Single-field extraction ────────────────────────────────────────────────

  const extractMutation = useMutation({
    mutationFn: (req: {
      group: string;
      field: string;
      fieldLabel: string;
      valueType: string;
      allowedValues: string[];
      sourceTextId: string;
      currentValue: string | null;
    }) =>
      catalogApi.venueEnrichmentExtract(venueId, {
        group: req.group,
        field: req.field,
        fieldLabel: req.fieldLabel,
        valueType: req.valueType,
        allowedValues: req.allowedValues,
        sourceTextId: req.sourceTextId,
        currentValue: req.currentValue,
      }),
  });

  function extractField(
    group: string,
    field: string,
    sourceTextId: string,
    onExtracted: (result: FieldExtractResult | null) => void,
  ) {
    // Resolve field metadata from spec for label / type / allowed values.
    const dotKey = group === field ? field : `${group}.${field}`;
    const def = METADATA_SECTIONS.flatMap((s) => s.fields).find(
      (f) => f.key === dotKey || f.key === field,
    );

    extractMutation.mutate(
      {
        group,
        field,
        fieldLabel: def?.label ?? field,
        valueType: def?.type ?? "string",
        allowedValues: def?.options?.map((o) => o.value) ?? [],
        sourceTextId,
        currentValue: null,
      },
      {
        onSuccess: (res: VenueFieldExtractionResponse) => {
          if (res.found && res.value) {
            onExtracted({
              group: res.group,
              field: res.field,
              value: res.value,
              evidence: res.evidence ?? null,
            });
          } else {
            onExtracted(null);
          }
        },
        onError: () => onExtracted(null),
      },
    );
  }

  /**
   * Extract all empty fields in a section sequentially (one API call per field).
   * Calls `onProgress` after each field: result is `null` when not found.
   * `done` is `true` on the last call.
   */
  async function extractSection(
    sectionKey: string,
    sourceTextId: string,
    currentMetadataRaw: string | null,
    onProgress: (result: FieldExtractResult | null, field: string, done: boolean) => void,
  ) {
    const section = METADATA_SECTIONS.find((s) => s.key === sectionKey);
    if (!section) return;

    // Determine which fields are currently empty.
    interface MetaRow {
      group: string;
      field: string;
      value: unknown;
    }
    interface ParsedMeta {
      items: MetaRow[];
    }
    let parsed: ParsedMeta | null = null;
    if (currentMetadataRaw) {
      try {
        const doc = JSON.parse(currentMetadataRaw) as unknown;
        if (
          doc !== null &&
          typeof doc === "object" &&
          Array.isArray((doc as { items?: unknown }).items)
        ) {
          parsed = doc as ParsedMeta;
        }
      } catch {
        // ignore parse errors — treat all fields as empty
      }
    }

    const isValueEmpty = (group: string, field: string): boolean => {
      if (!parsed) return true;
      const rows = parsed.items.filter((i: MetaRow) => i.group === group && i.field === field);
      if (rows.length === 0) return true;
      const val = rows[0]?.value;
      return val === null || val === undefined || val === "";
    };

    const editableFields = section.fields.filter(isAutoFillEligible);
    const emptyFields = editableFields.filter((f) => {
      const dotKey = f.key;
      const parts = dotKey.split(".").filter(Boolean);
      const grp = parts[0] ?? dotKey;
      const fld = parts.length > 1 ? parts.slice(1).join(".") : dotKey;
      return isValueEmpty(grp, fld);
    });

    for (let i = 0; i < emptyFields.length; i++) {
      const def = emptyFields[i]!;
      const parts = def.key.split(".").filter(Boolean);
      const grp = parts[0] ?? def.key;
      const fld = parts.length > 1 ? parts.slice(1).join(".") : def.key;
      const isLast = i === emptyFields.length - 1;

      await new Promise<void>((resolve) => {
        extractField(grp, fld, sourceTextId, (result) => {
          onProgress(result, def.key, isLast);
          resolve();
        });
      });
    }
  }

  function reset() {
    setHistory([]);
    setPendingPatches([]);
    suggestMutation.reset();
    applyMutation.reset();
    extractMutation.reset();
  }

  return {
    history,
    pendingPatches,
    dismissPatch,
    isSuggesting: suggestMutation.isPending,
    isApplying: applyMutation.isPending,
    suggestError: suggestMutation.error,
    applyError: applyMutation.error,
    send,
    applyPatches,
    reset,
    extractField,
    isExtracting: extractMutation.isPending,
    extractError: extractMutation.error,
    extractSection,
  };
}
