/** Who can discover and view a venue. */
export type VenueVisibility = "PUBLIC" | "PRIVATE";

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
  /** Brief "About" line — what the venue is and offers, shown under its name. */
  description: string | null;
  address: string | null;
  city: string | null;
  locationLat: number | null;
  locationLng: number | null;
  /** Optional relation to a master-catalog record. */
  masterVenueId: string | null;
  /** Who can discover/view the venue — PUBLIC (whole workspace) or PRIVATE (owner + shares). */
  visibility: VenueVisibility;
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

// ─── Sharing ──────────────────────────────────────────────────────────────────
// A venue grant lets another platform user open a venue they do not own.
// ADMIN grantees can in turn manage the share list; EDITOR grantees can edit content.

export type VenueShareRole = "ADMIN" | "EDITOR";

export interface VenueShare {
  id: string;
  venueId: string;
  sharedWithUserId: string;
  role: VenueShareRole;
  /** User who created the grant. */
  grantedBy: string;
  createdAt: string;
}

export interface VenueShareListResponse {
  items: VenueShare[];
}

export interface VenueShareRequest {
  sharedWithUserId: string;
  role: VenueShareRole;
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
  /** Title or source file name; null when the source has no name. */
  label: string | null;
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

// ─── Single-field extraction (per-source) ────────────────────────────────────

/** Request body for POST /venues/{venueId}/enrichment/extract */
export interface VenueFieldExtractionRequest {
  group: string;
  field: string;
  fieldLabel?: string | null;
  valueType?: string | null;
  allowedValues?: string[] | null;
  sourceTextId: string;
  currentValue?: string | null;
}

/** Response from POST /venues/{venueId}/enrichment/extract */
export interface VenueFieldExtractionResponse {
  group: string;
  field: string;
  value: string | null;
  evidence: string | null;
  found: boolean;
}
