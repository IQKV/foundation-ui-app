import { useState, useRef, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInterval } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createElement } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { venueAssetImportApi, uploadFileToPresignedUrl } from "@/shared/api";
import type { VenueAssetImportResponse } from "@/shared/api";

export type UploadStage =
  | "idle"
  | "initiating-upload"
  | "uploading"
  | "confirming"
  | "processing"
  | "done"
  | "error";

export interface UseUploadVenueDocumentResult {
  stage: UploadStage;
  progress: number; // 0–100, meaningful only during "uploading"
  venueId: string | null;
  upload: (file: File) => Promise<string | null>; // resolves when done or timed-out
  reset: () => void;
}

/** Poll interval while the worker processes the asset (ms). */
const POLL_INTERVAL_MS = 2_000;
/** Give up polling after 5 minutes; the worker may retry on its own. */
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

/**
 * Venue-less document import flow — uploads a file to the new tenant import
 * endpoint and polls for the processing worker's result.
 *
 *   1. Initiate — POST /v1/catalog/venue-assets/initiate (presigned URL + assetId)
 *   2. Upload   — PUT to MinIO with XHR progress events
 *   3. Confirm  — POST /v1/catalog/venue-assets/{assetId}/confirm (status: UPLOADED)
 *   4. Poll     — GET /v1/catalog/venue-assets/{assetId} until EXTRACTED or FAILED
 *
 * shortcut: polling is client-driven; upgrade to SSE when the backend ships it.
 */
export function useUploadVenueDocument(): UseUploadVenueDocumentResult {
  const queryClient = useQueryClient();
  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [venueId, setVenueId] = useState<string | null>(null);

  // Refs survive closure captures across async steps and interval callbacks.
  const assetIdRef = useRef<string | null>(null);
  const pollStartRef = useRef<number>(0);
  const resolveRef = useRef<((id: string | null) => void) | null>(null);

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setVenueId(null);
    assetIdRef.current = null;
    resolveRef.current = null;
  };

  // ── Polling interval — active only during "processing" stage ───────────────
  const interval = useInterval(() => {
    const assetId = assetIdRef.current;
    if (!assetId) return;

    if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
      interval.stop();
      setStage("error");
      notifications.show({
        title: "Processing timed out",
        message: "The venue is still being processed — check back shortly.",
        color: "orange",
        icon: createElement(IconX, { size: 16 }),
      });
      resolveRef.current?.(null);
      return;
    }

    venueAssetImportApi
      .getAsset(assetId)
      .then((asset: VenueAssetImportResponse) => {
        if (asset.status === "EXTRACTED" && asset.venueId) {
          interval.stop();
          setVenueId(asset.venueId);
          setStage("done");
          void queryClient.invalidateQueries({ queryKey: ["tenant", "venues"] });
          notifications.show({
            title: "Venue created",
            message: "Your document has been processed and the venue is ready.",
            color: "green",
            icon: createElement(IconCheck, { size: 16 }),
          });
          resolveRef.current?.(asset.venueId);
        } else if (asset.status === "FAILED") {
          interval.stop();
          setStage("error");
          notifications.show({
            title: "Processing failed",
            message: asset.failureReason ?? "Could not extract venue data from the document.",
            color: "red",
            icon: createElement(IconX, { size: 16 }),
          });
          resolveRef.current?.(null);
        }
        // UPLOADED / PARSING → keep polling
      })
      .catch(() => {
        // Network blip — keep polling; timeout guard above will eventually stop it.
      });
  }, POLL_INTERVAL_MS);

  const upload = useCallback(
    (file: File): Promise<string | null> => {
      return new Promise((resolve) => {
        resolveRef.current = resolve;

        void (async () => {
          try {
            // ── 1. Initiate ────────────────────────────────────────────────────
            setStage("initiating-upload");
            const initResponse = await venueAssetImportApi.initiateUpload({
              fileName: file.name,
              contentType: file.type || "application/octet-stream",
              sizeBytes: file.size,
            });
            assetIdRef.current = initResponse.assetId;

            // ── 2. Upload to MinIO ─────────────────────────────────────────────
            setStage("uploading");
            setProgress(0);
            await uploadFileToPresignedUrl(initResponse.presignedUploadUrl, file, setProgress);

            // ── 3. Confirm ─────────────────────────────────────────────────────
            setStage("confirming");
            await venueAssetImportApi.confirmUpload(initResponse.assetId, {
              objectKey: initResponse.objectKey,
              fileName: file.name,
              assetType: file.type.startsWith("image/") ? "PHOTO" : "DOCUMENT",
            });

            // ── 4. Poll for processing result ──────────────────────────────────
            setStage("processing");
            pollStartRef.current = Date.now();
            interval.start();
          } catch {
            interval.stop();
            setStage("error");
            notifications.show({
              title: "Upload failed",
              message: "Could not complete the document upload. Please try again.",
              color: "red",
              icon: createElement(IconX, { size: 16 }),
            });
            resolve(null);
          }
        })();
      });
    },
    [interval],
  );

  return { stage, progress, venueId, upload, reset };
}
