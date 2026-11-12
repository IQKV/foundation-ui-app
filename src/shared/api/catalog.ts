import { httpClient } from "./http-client";
import type {
  Venue,
  VenueListResponse,
  ListVenueParams,
  VenueAssetPublic,
  VenueAssetListResponse,
  VenueAsset,
  VenueAssetFullListResponse,
  VenueAssetPreviewUrlResponse,
  VenueAssetImportStatus,
} from "@/entities/venue";

export type {
  Venue,
  VenueListResponse,
  ListVenueParams,
  VenueAssetPublic,
  VenueAssetListResponse,
  VenueAsset,
  VenueAssetFullListResponse,
  VenueAssetPreviewUrlResponse,
  VenueAssetImportStatus,
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
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  /** Optional relation to a master-catalog record. */
  masterVenueId?: string | null;
}

export interface VenuePatchRequest {
  name?: string | null;
  address?: string | null;
  city?: string | null;
  locationLat?: number | null;
  locationLng?: number | null;
  masterVenueId?: string | null;
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

  // Tenant venue asset photos — TENANT_OWNER / MEMBER.
  // Used by the venue detail Photos tab.
  listVenueAssetPhotos: (venueId: string) =>
    httpClient
      .get<VenueAssetListResponse>(`/v1/catalog/venues/${venueId}/assets/photos`)
      .then((r) => r.data),

  // All assets of a venue — photos and attachments — TENANT_OWNER / MEMBER.
  // Used by the venue detail Assets tab.
  listVenueAssets: (venueId: string) =>
    httpClient
      .get<VenueAssetFullListResponse>(`/v1/catalog/venues/${venueId}/assets`)
      .then((r) => r.data),
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
    httpClient
      .delete(`/v1/catalog/venues/${venueId}/assets/${assetId}`)
      .then(() => undefined),
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
