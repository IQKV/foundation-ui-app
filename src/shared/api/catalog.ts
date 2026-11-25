import { httpClient } from "./http-client";
import type {
  Venue,
  VenueListResponse,
  ListVenueParams,
  VenueVisibility,
  VenueShare,
  VenueShareListResponse,
  VenueShareRequest,
  VenueAssetPublic,
  VenueAssetListResponse,
  VenueAsset,
  VenueAssetFullListResponse,
  VenueAssetPreviewUrlResponse,
  VenueAssetImportStatus,
  VenueTextContent,
  VenueTextContentListResponse,
  VenueEnrichmentSuggestion,
  VenueEnrichmentSuggestionRequest,
  VenueEnrichmentSuggestionResponse,
  VenueEnrichmentApplyRequest,
  VenueFieldExtractionRequest,
  VenueFieldExtractionResponse,
} from "@/entities/venue";

export type {
  Venue,
  VenueListResponse,
  ListVenueParams,
  VenueVisibility,
  VenueShare,
  VenueShareListResponse,
  VenueShareRequest,
  VenueAssetPublic,
  VenueAssetListResponse,
  VenueAsset,
  VenueAssetFullListResponse,
  VenueAssetPreviewUrlResponse,
  VenueAssetImportStatus,
  VenueTextContent,
  VenueTextContentListResponse,
  VenueEnrichmentSuggestion,
  VenueEnrichmentSuggestionRequest,
  VenueEnrichmentSuggestionResponse,
  VenueEnrichmentApplyRequest,
  VenueFieldExtractionRequest,
  VenueFieldExtractionResponse,
} from "@/entities/venue";

// ─── Tenant-scoped Catalog API ────────────────────────────────────────────────
// Endpoints live at /v1/catalog/venues — tenant context comes from the JWT
// tenant_id claim (resolved by TenantExtractionFilter) plus the X-Tenant-ID
// header attached by the auth interceptor; no tenantKey in the path.
//
// The tenant write surface mirrors the admin venue shape but tenant-scoped. The
// tenant never manages ingestion-provenance fields (metadata, confidence,
// source) — those are hidden on read (safe projection) and absent on write.

export interface VenueWriteRequest {
  name: string;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  /** Optional relation to a master-catalog record. */
  masterVenueId?: string | null;
  /** Omit to let the backend default (PUBLIC for orgs, PRIVATE for personal workspaces). */
  visibility?: VenueVisibility | null;
}

export interface VenuePatchRequest {
  name?: string | null;
  description?: string | null;
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  masterVenueId?: string | null;
  visibility?: VenueVisibility | null;
}

/** Metadata-only patch — the full serialised MetadataDocument JSON string. */
export interface VenueMetadataPatchRequest {
  metadata: string;
}

// ─── Semantic (AI) search ─────────────────────────────────────────────────────

/** A ranked venue — the safe projection plus its cosine similarity score. */
export interface SemanticSearchResult extends Venue {
  similarity: number;
}

/**
 * Hard filters the AI query planner extracted from the natural-language query.
 * Empty/null members mean the planner did not derive that constraint.
 */
export interface SemanticSearchFilters {
  city: string | null;
  venueTypes: string[];
  minCapacity: number | null;
  maxCapacity: number | null;
  cateringPolicy: string | null;
  amenities: string[];
  accessible: boolean | null;
}

export interface SemanticSearchResponse {
  items: SemanticSearchResult[];
  totalElements: number;
  appliedFilters: SemanticSearchFilters;
}

export interface SemanticSearchParams {
  q: string;
  city?: string;
  limit?: number;
}

/** Asset count breakdown returned by GET /v1/catalog/venues/{venueId}/assets/count. */
export interface VenueAssetCountResponse {
  venueId: string;
  total: number;
  photos: number;
  documents: number;
}

/** Source-text count returned by GET /v1/catalog/venue-text-contents/venue/{venueId}/count. */
export interface VenueTextContentCountResponse {
  venueId: string;
  total: number;
}

export const catalogApi = {
  listVenues: (params: ListVenueParams = {}) =>
    httpClient.get<VenueListResponse>("/v1/catalog/venues", { params }).then((r) => r.data),

  // Semantic (AI) search over the tenant's own venues; returns the safe projection
  // ranked by similarity plus the hard filters the query planner derived.
  semanticSearch: (params: SemanticSearchParams) =>
    httpClient
      .get<SemanticSearchResponse>("/v1/catalog/venues/search/semantic", { params })
      .then((r) => r.data),

  getVenue: (id: string) => httpClient.get<Venue>(`/v1/catalog/venues/${id}`).then((r) => r.data),

  createVenue: (data: VenueWriteRequest) =>
    httpClient.post<Venue>("/v1/catalog/venues", data).then((r) => r.data),

  replaceVenue: (id: string, data: VenueWriteRequest) =>
    httpClient.put<Venue>(`/v1/catalog/venues/${id}`, data).then((r) => r.data),

  patchVenue: (id: string, data: VenuePatchRequest) =>
    httpClient.patch<Venue>(`/v1/catalog/venues/${id}`, data).then((r) => r.data),

  patchVenueMetadata: (id: string, data: VenueMetadataPatchRequest) =>
    httpClient.patch<Venue>(`/v1/catalog/venues/${id}/metadata`, data).then((r) => r.data),

  deleteVenue: (id: string) => httpClient.delete(`/v1/catalog/venues/${id}`).then(() => undefined),

  // Bulk delete is a collection-level DELETE with the ids in the JSON body.
  // The backend caps the list at 100 ids and silently ignores unknown ids.
  bulkDeleteVenues: (ids: string[]) =>
    httpClient.delete("/v1/catalog/venues", { data: { ids } }).then(() => undefined),

  // Per-venue sharing — grants that let other platform users open the venue.
  // Any workspace member may list shares; only the owner or an ADMIN grantee
  // may add / change-role / revoke (enforced server-side → 403).
  listVenueShares: (venueId: string) =>
    httpClient
      .get<VenueShareListResponse>(`/v1/catalog/venues/${venueId}/shares`)
      .then((r) => r.data),

  addVenueShare: (venueId: string, data: VenueShareRequest) =>
    httpClient.post<VenueShare>(`/v1/catalog/venues/${venueId}/shares`, data).then((r) => r.data),

  updateVenueShareRole: (venueId: string, userId: string, data: VenueShareRequest) =>
    httpClient
      .patch<VenueShare>(`/v1/catalog/venues/${venueId}/shares/${userId}`, data)
      .then((r) => r.data),

  removeVenueShare: (venueId: string, userId: string) =>
    httpClient.delete(`/v1/catalog/venues/${venueId}/shares/${userId}`).then(() => undefined),

  // Tenant venue asset photos — TENANT_OWNER / MEMBER.
  // Used by the venue detail Photos tab.
  listVenueAssetPhotos: (venueId: string) =>
    httpClient
      .get<VenueAssetListResponse>(`/v1/catalog/venues/${venueId}/assets/photos`)
      .then((r) => r.data),

  // Photos of the master-catalog venue this venue is linked to, when it has one —
  // TENANT_OWNER / MEMBER. Shown beneath the venue's own photos. Empty when unlinked.
  listVenueMasterPhotos: (venueId: string) =>
    httpClient
      .get<VenueAssetListResponse>(`/v1/catalog/venues/${venueId}/assets/master-photos`)
      .then((r) => r.data),

  // All assets of a venue — photos and attachments — TENANT_OWNER / MEMBER.
  // Used by the venue detail Assets tab.
  listVenueAssets: (venueId: string) =>
    httpClient
      .get<VenueAssetFullListResponse>(`/v1/catalog/venues/${venueId}/assets`)
      .then((r) => r.data),

  // Text-content rows (extracted source chunks) linked to a venue — TENANT_OWNER / MEMBER.
  // Used by the venue detail Sources tab.
  listVenueTextContents: (venueId: string) =>
    httpClient
      .get<VenueTextContentListResponse>(`/v1/catalog/venue-text-contents/venue/${venueId}`)
      .then((r) => r.data),

  // Count-only endpoints — avoids loading full collections just for badge/stat numbers.
  countVenueAssets: (venueId: string) =>
    httpClient
      .get<VenueAssetCountResponse>(`/v1/catalog/venues/${venueId}/assets/count`)
      .then((r) => r.data),

  countVenueTextContents: (venueId: string) =>
    httpClient
      .get<VenueTextContentCountResponse>(`/v1/catalog/venue-text-contents/venue/${venueId}/count`)
      .then((r) => r.data),

  // AI enrichment — suggestions and atomic apply.
  // LLM calls can take up to ~2 min on cold Ollama instances; override the
  // global 30 s timeout for all three AI endpoints.
  venueEnrichmentSuggestions: (venueId: string, data: VenueEnrichmentSuggestionRequest) =>
    httpClient
      .post<VenueEnrichmentSuggestionResponse>(
        `/v1/catalog/venues/${venueId}/enrichment/suggestions`,
        data,
        { timeout: 120_000 },
      )
      .then((r) => r.data),

  venueEnrichmentApply: (venueId: string, data: VenueEnrichmentApplyRequest) =>
    httpClient
      .post<Venue>(`/v1/catalog/venues/${venueId}/enrichment/apply`, data, { timeout: 120_000 })
      .then((r) => r.data),

  // Single-field extraction from a preloaded source document.
  // Returns found=false instead of erroring when the model is unavailable or the
  // source has no value for the field.
  venueEnrichmentExtract: (venueId: string, data: VenueFieldExtractionRequest) =>
    httpClient
      .post<VenueFieldExtractionResponse>(
        `/v1/catalog/venues/${venueId}/enrichment/extract`,
        data,
        { timeout: 120_000 },
      )
      .then((r) => r.data),
};

/** Smart note attached to a tenant venue. */
export interface VenueSmartNote {
  id: string;
  venueId: string;
  title: string | null;
  /** HTML content produced by the Mantine rich-text editor. */
  content: string | null;
  /** Hex code or design-token name for the card background colour. */
  color: string | null;
  tags: string[] | null;
  authorId: string;
  linkedAssetId: string | null;
  sortOrder: number;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VenueSmartNoteListResponse {
  items: VenueSmartNote[];
  totalElements: number;
}

export interface VenueSmartNoteCreateRequest {
  venueId: string;
  title?: string | null;
  content?: string | null;
  color?: string | null;
  tags?: string[] | null;
  linkedAssetId?: string | null;
  sortOrder?: number | null;
  pinned?: boolean | null;
}

export interface VenueSmartNotePatchRequest {
  title?: string | null;
  content?: string | null;
  color?: string | null;
  tags?: string[] | null;
  linkedAssetId?: string | null;
  sortOrder?: number | null;
  pinned?: boolean | null;
}

export const venueSmartNoteApi = {
  list: (venueId: string, params?: { direction?: string; pinned?: boolean }) =>
    httpClient
      .get<VenueSmartNoteListResponse>(`/v1/catalog/venue-smart-notes/venue/${venueId}`, {
        params,
      })
      .then((r) => r.data),

  create: (data: VenueSmartNoteCreateRequest) =>
    httpClient.post<VenueSmartNote>("/v1/catalog/venue-smart-notes", data).then((r) => r.data),

  patch: (id: string, data: VenueSmartNotePatchRequest) =>
    httpClient
      .patch<VenueSmartNote>(`/v1/catalog/venue-smart-notes/${id}`, data)
      .then((r) => r.data),

  setPinned: (id: string, pinned: boolean) =>
    httpClient
      .put<VenueSmartNote>(`/v1/catalog/venue-smart-notes/${id}/pinned`, { pinned })
      .then((r) => r.data),

  delete: (id: string) =>
    httpClient.delete(`/v1/catalog/venue-smart-notes/${id}`).then(() => undefined),
};

export interface VenueChatSource {
  sourceTextId: string;
  assetId: string | null;
  label: string | null;
  snippet: string;
  /** 1-based page the snippet was taken from; `null` when the source document has no pages. */
  page: number | null;
  similarity: number;
}

export interface VenueChatSendRequest {
  sessionId?: string;
  /** Grounds this turn in one specific venue instead of the whole catalogue. */
  venueId?: string;
  content: string;
  model?: string;
}

export interface VenueChatResponse {
  sessionId: string;
  sessionTitle: string | null;
  reply: string;
  model: string;
  timestamp: string;
  sources: VenueChatSource[];
}

export interface VenueChatSession {
  id: string;
  userId: string;
  title: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueChatSessionListResponse {
  items: VenueChatSession[];
  totalElements: number;
}

export interface VenueChatMessage {
  id: string;
  sessionId: string;
  role: "USER" | "ASSISTANT";
  content: string;
  createdAt: string;
  /** Source chunks the reply was grounded in; empty for user turns. */
  sources: VenueChatSource[];
}

export interface VenueChatMessageListResponse {
  items: VenueChatMessage[];
  totalElements: number;
}

export const venueChatApi = {
  send: (body: VenueChatSendRequest) =>
    httpClient
      .post<VenueChatResponse>("/v1/catalog/chat", body, { timeout: 120_000 })
      .then((r) => r.data),

  getSessions: (params?: { limit?: number; offset?: number }) =>
    httpClient
      .get<VenueChatSessionListResponse>("/v1/catalog/chat/sessions", { params })
      .then((r) => r.data),

  getMessages: (sessionId: string, params?: { limit?: number; offset?: number }) =>
    httpClient
      .get<VenueChatMessageListResponse>(
        `/v1/catalog/chat/sessions/${encodeURIComponent(sessionId)}/messages`,
        { params },
      )
      .then((r) => r.data),

  deleteSession: (sessionId: string) =>
    httpClient
      .delete(`/v1/catalog/chat/sessions/${encodeURIComponent(sessionId)}`)
      .then(() => undefined),
};

// ─── Venue asset upload ───────────────────────────────────────────────────────
// Two-phase presigned flow: initiate → PUT to presigned URL → confirm.
// The presigned PUT goes directly to MinIO (bypasses our API), so XHR is used
// for progress events on large files. The backend reads size/content-type back
// from the stored object at confirm time.

export interface InitiateAssetUploadRequest {
  fileName: string;
  contentType: string;
  sizeBytes: number;
}

export interface InitiateAssetUploadResponse {
  assetId: string;
  presignedUploadUrl: string;
  objectKey: string;
  expiresInMinutes: number;
}

export interface ConfirmAssetUploadRequest {
  objectKey: string;
  fileName: string;
  assetType: string;
  photoCategory?: string | null;
  displayOrder?: number | null;
  label?: string | null;
}

export interface VenueAssetResponse {
  id: string;
  venueId: string;
  assetType: string;
  photoCategory: string | null;
  displayOrder: number | null;
  label: string | null;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  s3Key: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const venueAssetApi = {
  initiateUpload: (venueId: string, data: InitiateAssetUploadRequest) =>
    httpClient
      .post<InitiateAssetUploadResponse>(`/v1/catalog/venues/${venueId}/assets/initiate`, data)
      .then((r) => r.data),

  confirmUpload: (venueId: string, assetId: string, data: ConfirmAssetUploadRequest) =>
    httpClient
      .post<VenueAssetResponse>(`/v1/catalog/venues/${venueId}/assets/${assetId}/confirm`, data)
      .then((r) => r.data),

  // Presigned GET URL for one asset — TENANT_OWNER / MEMBER.
  // Lets the browser render the object inline in the Assets tab preview modal.
  previewUrl: (venueId: string, assetId: string) =>
    httpClient
      .get<VenueAssetPreviewUrlResponse>(
        `/v1/catalog/venues/${venueId}/assets/${assetId}/preview-url`,
      )
      .then((r) => r.data),

  deleteAsset: (venueId: string, assetId: string): Promise<void> =>
    httpClient.delete(`/v1/catalog/venues/${venueId}/assets/${assetId}`).then(() => undefined),
};

/**
 * PUT a file to a presigned S3/MinIO URL with upload-progress callbacks.
 * Uses XHR so the browser fires real progress events; axios does not support
 * upload progress for PUT out of the box when the body is a File/Blob.
 */
export function uploadFileToPresignedUrl(
  presignedUrl: string,
  file: File,
  onProgress: (pct: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", presignedUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resolve()
        : reject(new Error(`Upload failed: ${xhr.status}`));
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

// ─── Venue-less asset import ──────────────────────────────────────────────────
// Two-phase presigned flow on the venue-less import surface:
//   POST /v1/catalog/venue-assets/initiate  → presigned URL + assetId
//   PUT to presigned URL (XHR, same uploadFileToPresignedUrl helper)
//   POST /v1/catalog/venue-assets/{id}/confirm
//   GET  /v1/catalog/venue-assets/{id}       — polled until EXTRACTED or FAILED

/** Full shape returned by the import surface (includes processing status). */
export interface VenueAssetImportResponse {
  id: string;
  /** Null until the processing worker links the derived venue. */
  venueId: string | null;
  status: VenueAssetImportStatus;
  /** Populated when status === "FAILED". */
  failureReason: string | null;
  assetType: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  s3Key: string;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

export const venueAssetImportApi = {
  initiateUpload: (data: InitiateAssetUploadRequest) =>
    httpClient
      .post<InitiateAssetUploadResponse>("/v1/catalog/venue-assets/initiate", data)
      .then((r) => r.data),

  confirmUpload: (assetId: string, data: ConfirmAssetUploadRequest) =>
    httpClient
      .post<VenueAssetImportResponse>(`/v1/catalog/venue-assets/${assetId}/confirm`, data)
      .then((r) => r.data),

  getAsset: (assetId: string) =>
    httpClient
      .get<VenueAssetImportResponse>(`/v1/catalog/venue-assets/${assetId}`)
      .then((r) => r.data),
};
