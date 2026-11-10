import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { createElement } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { catalogApi, venueAssetApi, uploadFileToPresignedUrl } from "@/shared/api";
import { toWriteRequest, emptyVenueFormValues } from "./types";

export type UploadStage =
  | "idle"
  | "creating-venue"
  | "initiating-upload"
  | "uploading"
  | "confirming"
  | "done"
  | "error";

export interface UseUploadVenueDocumentResult {
  stage: UploadStage;
  progress: number; // 0-100, meaningful only during "uploading"
  venueId: string | null;
  upload: (file: File) => Promise<string | null>; // returns venueId on success
  reset: () => void;
}

/**
 * Three-phase presigned upload flow:
 *   1. Create a blank venue named after the file (so we have a venueId to attach the asset to).
 *   2. Initiate upload — back-end mints a presigned PUT URL and an assetId.
 *   3. PUT the file directly to MinIO with XHR progress events.
 *   4. Confirm — back-end reads size/contentType from storage and persists the asset row.
 *
 * shortcut: venue is created with filename as name; user can rename it on the detail page.
 */
export function useUploadVenueDocument(): UseUploadVenueDocumentResult {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [venueId, setVenueId] = useState<string | null>(null);
  // keep venueId across async steps without stale-closure issues
  const venueIdRef = useRef<string | null>(null);

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setVenueId(null);
    venueIdRef.current = null;
  };

  const upload = async (file: File): Promise<string | null> => {
    try {
      // ── 1. Create a blank venue ──────────────────────────────────────────
      setStage("creating-venue");
      const nameWithoutExt = file.name.replace(/\.[^.]+$/, "").trim() || file.name;
      const writeRequest = toWriteRequest({
        ...emptyVenueFormValues(),
        name: nameWithoutExt,
      });
      const venue = await catalogApi.createVenue(writeRequest);
      venueIdRef.current = venue.id;
      setVenueId(venue.id);

      // ── 2. Initiate upload ───────────────────────────────────────────────
      setStage("initiating-upload");
      const initResponse = await venueAssetApi.initiateUpload(venue.id, {
        fileName: file.name,
        contentType: file.type || "application/octet-stream",
        sizeBytes: file.size,
      });

      // ── 3. PUT to presigned URL with progress ────────────────────────────
      setStage("uploading");
      setProgress(0);
      await uploadFileToPresignedUrl(initResponse.presignedUploadUrl, file, setProgress);

      // ── 4. Confirm ────────────────────────────────────────────────────────
      setStage("confirming");
      await venueAssetApi.confirmUpload(venue.id, initResponse.assetId, {
        objectKey: initResponse.objectKey,
        fileName: file.name,
        // Documents that are not photos go in as DOCUMENT; photos are detected by content type.
        assetType: file.type.startsWith("image/") ? "PHOTO" : "DOCUMENT",
      });

      void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
      notifications.show({
        title: "Venue document uploaded",
        message: `${nameWithoutExt} — processing will start shortly.`,
        color: "green",
        icon: createElement(IconCheck, { size: 16 }),
      });
      setStage("done");
      return venue.id;
    } catch {
      setStage("error");
      // If venue creation succeeded but a later step failed, we still have the venueId so the
      // caller can redirect there and let the user retry the upload from the detail page.
      notifications.show({
        title: "Upload failed",
        message: "Could not complete the document upload. Please try again.",
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
      return venueIdRef.current;
    }
  };

  return { stage, progress, venueId, upload, reset };
}
