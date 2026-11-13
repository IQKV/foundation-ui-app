/**
 * Tenant venue — the safe projection returned by the tenant /venues surface.
 *
 * Per the catalog service contract, the safe projection omits `metadata`,
 * `confidence` and `source`, and keeps the optional `masterVenueId` relation
 * key. Per-venue photos and assets are available via the /venues/{id}/assets
 * sub-resource (TENANT_OWNER / MEMBER).
 */
export interface Venue {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  /** Optional relation to a master-catalog record. */
  masterVenueId: string | null;
  /**
   * Serialised MetadataDocument JSON string. Returned by the backend on the safe projection so
   * tenants can read and edit their own venue metadata.
   */
  metadata: string | null;
  /** Primary photo URL when the venue has one; null when no photo is available. */
  primaryPhotoUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VenueListResponse {
  items: Venue[];
  totalElements: number;
}

/** Lightweight photo returned by the master-venue photos sub-resource. */
export interface VenueAssetPublic {
  id: string;
  assetType: string;
  displayOrder: number | null;
  label: string | null;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  sourceUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VenueAssetListResponse {
  items: VenueAssetPublic[];
  totalElements: number;
}

/**
 * Full venue asset as returned by the venue assets sub-resource
 * (GET /venues/{id}/assets) — photos and attachments alike.
 *
 * Unlike {@link VenueAssetPublic} it carries no presigned `sourceUrl`; the
 * storage key (`s3Key`) and pipeline `status` are surfaced instead.
 */
export interface VenueAsset {
  id: string;
  venueId: string;
  assetType: string;
  photoCategory: string | null;
  displayOrder: number | null;
  label: string | null;
  fileName: string | null;
  contentType: string | null;
  sizeBytes: number | null;
  s3Key: string | null;
  uploadedBy: string | null;
  status: string | null;
  failureReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface VenueAssetFullListResponse {
  items: VenueAsset[];
  totalElements: number;
}

/**
 * One venue text-content row (`VenueTextContentResponse`) — a raw or markdown
 * text chunk extracted from a venue source document.
 */
export interface VenueTextContent {
  id: string;
  venueId: string | null;
  sourceAssetId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface VenueTextContentListResponse {
  items: VenueTextContent[];
  totalElements: number;
}

/**
 * Presigned preview URL for one asset
 * (GET /venues/{id}/assets/{assetId}/preview-url) — lets the browser render the stored object
 * inline, images and PDFs alike.
 */
export interface VenueAssetPreviewUrlResponse {
  assetId: string;
  url: string;
  contentType: string | null;
  fileName: string | null;
  expiresInMinutes: number;
}

/**
 * Processing status of a venue-less imported asset.
 * Set by the catalog service and advanced by the processing worker.
 */
export type VenueAssetImportStatus = "UPLOADED" | "PARSING" | "EXTRACTED" | "FAILED";

export interface ListVenueParams {
  search?: string;
  city?: string;
  limit?: number;
  offset?: number;
  sortBy?: string;
  sortDir?: string;
}

// ─── Enrichment ───────────────────────────────────────────────────────────────

/** One AI-suggested metadata field patch — mirrors the backend VenueEnrichmentSuggestion. */
export interface VenueEnrichmentSuggestion {
  group: string;
  field: string;
  value: string;
}

export interface VenueEnrichmentSuggestionRequest {
  message: string;
  fieldHint?: string | null;
  currentMetadata?: string | null;
}

export interface VenueEnrichmentSuggestionResponse {
  reply: string;
  suggestedPatches: VenueEnrichmentSuggestion[];
}

export interface VenueEnrichmentApplyRequest {
  patches: VenueEnrichmentSuggestion[];
}
