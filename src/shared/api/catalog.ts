import { httpClient } from "./http-client";
import type {
  Venue,
  VenueListResponse,
  ListVenueParams,
  VenueAssetPublic,
  VenueAssetListResponse,
} from "@/entities/venue";

// Re-export entity types so existing imports from "@/shared/api" keep working.
export type {
  Venue,
  VenueListResponse,
  ListVenueParams,
  VenueAssetPublic,
  VenueAssetListResponse,
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
};
