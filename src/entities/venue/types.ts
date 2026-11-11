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
 * Processing status of a venue-less imported asset.
 * Set by the catalog service and advanced by the processing worker.
 */
export type VenueAssetImportStatus = "UPLOADED" | "PARSING" | "EXTRACTED" | "FAILED";

export interface ListVenueParams {
  search?: string;
  city?: string;
  limit?: number;
  offset?: number;
  /** Sort field — "name" or omit for recently added (default). */
  sortBy?: string;
  /** Sort direction — "asc" or "desc". */
  sortDir?: string;
}
