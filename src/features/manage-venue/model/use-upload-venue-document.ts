import { useState, useRef, useCallback, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useInterval } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { createElement } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";
import { venueAssetImportApi, uploadFileToPresignedUrl } from "@/shared/api";
import type { VenueAssetImportResponse } from "@/shared/api";
import { useNotificationStore } from "@/features/notification-bell";

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

/** Fallback poll interval — fires when WebSocket push does not arrive (ms). */
const FALLBACK_POLL_MS = 5_000;
/** Give up after 5 minutes; the worker may retry on its own. */
const POLL_TIMEOUT_MS = 5 * 60 * 1_000;

/**
 * Venue-less document import flow — uploads a file to the tenant import endpoint, then
 * waits for the processing worker's result.
 *
 *   1. Initiate — POST /v1/catalog/venue-assets/initiate (presigned URL + assetId)
 *   2. Upload   — PUT to MinIO with XHR progress events
 *   3. Confirm  — POST /v1/catalog/venue-assets/{assetId}/confirm (status: UPLOADED)
 *   4. Wait     — primary: pushSeq from STOMP WebSocket; fallback: 5-second poll
 *
 * When the processing worker finishes it publishes a UserPushNotificationEvent to
 * notification.iam.push → IAM persists the row → pushes via STOMP → NotificationBell
 * bumps pushSeq → the useEffect below fires a single GET to confirm the final status.
 * The useInterval fallback covers environments where messaging is disabled.
 */
export function useUploadVenueDocument(): UseUploadVenueDocumentResult {
  const queryClient = useQueryClient();
  const pushSeq = useNotificationStore((s) => s.pushSeq);

  const [stage, setStage] = useState<UploadStage>("idle");
  const [progress, setProgress] = useState(0);
  const [venueId, setVenueId] = useState<string | null>(null);

  // Refs survive closure captures across async steps and interval/effect callbacks.
  const assetIdRef = useRef<string | null>(null);
  const pollStartRef = useRef<number>(0);
  const resolveRef = useRef<((id: string | null) => void) | null>(null);
  const stageRef = useRef<UploadStage>("idle");

  // Keep stageRef in sync so callbacks read the latest stage without stale closures.
  stageRef.current = stage;

  const reset = () => {
    setStage("idle");
    setProgress(0);
    setVenueId(null);
    assetIdRef.current = null;
    resolveRef.current = null;
  };

  /** Shared settle logic — called from both the WebSocket effect and the fallback interval. */
  const checkAsset = useCallback(() => {
    const assetId = assetIdRef.current;
    if (!assetId || stageRef.current !== "processing") return;

    if (Date.now() - pollStartRef.current > POLL_TIMEOUT_MS) {
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
          setStage("error");
          notifications.show({
            title: "Processing failed",
            message: asset.failureReason ?? "Could not extract venue data from the document.",
            color: "red",
            icon: createElement(IconX, { size: 16 }),
          });
          resolveRef.current?.(null);
        }
        // UPLOADED / PARSING → not done yet, wait for next signal
      })
      .catch(() => {
        // Network blip — ignore; next push or fallback poll will retry
      });
  }, [queryClient]);

  // ── Primary: react to WebSocket pushes ────────────────────────────────────
  // pushSeq increments each time any STOMP message arrives on /user/queue/notifications.
  // We only act during the "processing" stage; all other stages ignore the signal.
  useEffect(() => {
    if (stageRef.current === "processing") {
      checkAsset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pushSeq]);

  // ── Fallback: slow poll for environments without messaging ─────────────────
  // Active only during "processing"; stops itself once the stage changes.
  const fallbackInterval = useInterval(() => {
    if (stageRef.current !== "processing") {
      fallbackInterval.stop();
      return;
    }
    checkAsset();
  }, FALLBACK_POLL_MS);

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

            // ── 4. Wait for processing result ──────────────────────────────────
            setStage("processing");
            pollStartRef.current = Date.now();
            fallbackInterval.start();
          } catch {
            fallbackInterval.stop();
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
    [fallbackInterval],
  );

  return { stage, progress, venueId, upload, reset };
}
