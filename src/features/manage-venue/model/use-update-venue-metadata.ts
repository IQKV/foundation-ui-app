import { createElement } from "react";
import { notifications } from "@mantine/notifications";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IconCheck, IconX } from "@tabler/icons-react";
import { catalogApi } from "@/shared/api";
import { setFieldValue } from "./metadata-utils";
import type { MetadataDocument } from "./metadata-utils";
import type { MetadataFieldDefinition } from "./metadata-spec";

export interface VenueMetadataChange {
  field: MetadataFieldDefinition;
  value: unknown;
}

export interface SaveVenueMetadataPayload {
  base: MetadataDocument;
  changes: VenueMetadataChange[];
}

interface UseUpdateVenueMetadataOptions {
  venueId: string;
  sectionLabel: string;
  onSuccess: () => void;
}

/**
 * Saves a single metadata section by merging its changed fields into the
 * current document and PATCHing the full metadata string.
 *
 * shortcut: last write wins — concurrent section edits can clobber each other.
 * Acceptable for single-editor tenant console.
 */
export function useUpdateVenueMetadata({
  venueId,
  sectionLabel,
  onSuccess,
}: UseUpdateVenueMetadataOptions) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ base, changes }: SaveVenueMetadataPayload) => {
      const next = changes.reduce(
        (acc, change) => setFieldValue(acc, change.field, change.value),
        base,
      );
      return catalogApi.patchVenueMetadata(venueId, { metadata: JSON.stringify(next) });
    },
    onSuccess: () => {
      notifications.show({
        title: "Metadata updated",
        message: `${sectionLabel} saved.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
      void queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId] });
      onSuccess();
    },
    onError: () => {
      notifications.show({
        title: "Update failed",
        message: "Could not save the metadata. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
  });
}
