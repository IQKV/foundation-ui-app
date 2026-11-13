import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogApi } from "@/shared/api";
import type {
  VenueEnrichmentSuggestion,
  VenueEnrichmentSuggestionResponse,
} from "@/entities/venue";

export interface EnrichmentTurn {
  message: string;
  response: VenueEnrichmentSuggestionResponse;
}

export interface UseVenueEnrichmentResult {
  /** Chat history — each send appends one turn. */
  history: EnrichmentTurn[];
  /** Suggestions from the latest turn, before the user accepts/dismisses each. */
  pendingPatches: VenueEnrichmentSuggestion[];
  dismissPatch: (patch: VenueEnrichmentSuggestion) => void;
  isSuggesting: boolean;
  isApplying: boolean;
  suggestError: Error | null;
  applyError: Error | null;
  send: (message: string, fieldHint?: string) => void;
  applyPatches: (patches: VenueEnrichmentSuggestion[], currentMetadata: string | null) => void;
  reset: () => void;
}

export function useVenueEnrichment(venueId: string): UseVenueEnrichmentResult {
  const queryClient = useQueryClient();
  const [history, setHistory] = useState<EnrichmentTurn[]>([]);
  const [pendingPatches, setPendingPatches] = useState<VenueEnrichmentSuggestion[]>([]);

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
    // Pass current metadata from the last cached venue so the backend can skip already-filled fields.
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

  function reset() {
    setHistory([]);
    setPendingPatches([]);
    suggestMutation.reset();
    applyMutation.reset();
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
  };
}
