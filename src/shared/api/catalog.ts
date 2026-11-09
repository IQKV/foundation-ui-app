import { httpClient } from "./http-client";
import type { Venue, VenueListResponse, ListVenueParams } from "@/entities/venue";

// Re-export entity types so existing imports from "@/shared/api" keep working.
export type { Venue, VenueListResponse, ListVenueParams };

// ─── Tenant-scoped Catalog API ────────────────────────────────────────────────
// Endpoints live at /v1/catalog/venues — tenant context comes from the JWT
// tenant_id claim (resolved by TenantExtractionFilter) plus the X-Tenant-ID
// header attached by the auth interceptor; no tenantKey in the path.
// The tenant venue surface is read-only (GET list + GET detail).

export const catalogApi = {
  listVenues: (params: ListVenueParams = {}) =>
    httpClient.get<VenueListResponse>("/v1/catalog/venues", { params }).then((r) => r.data),

  getVenue: (id: string) => httpClient.get<Venue>(`/v1/catalog/venues/${id}`).then((r) => r.data),
};
