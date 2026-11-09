/**
 * Tenant venue — the safe projection returned by the tenant /venues surface.
 *
 * Per the catalog service contract, the safe projection omits `metadata`,
 * `confidence` and `source`, and keeps the optional `masterVenueId` relation
 * key. There are no per-venue asset/photo sub-resources on the tenant surface.
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
