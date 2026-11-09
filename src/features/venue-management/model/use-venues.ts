import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/shared/api";
import type { ListVenueParams } from "@/entities/venue";

/**
 * Tenant venue list — read-only, paginated by `limit`/`offset`, filterable by
 * `search` (keyword) and `city` (exact). Tenant scope comes from the JWT.
 */
export function useVenues(params: ListVenueParams) {
  return useQuery({
    queryKey: [
      "tenant",
      "venues",
      params.search ?? "",
      params.city ?? "",
      params.limit ?? 0,
      params.offset ?? 0,
    ],
    queryFn: () => catalogApi.listVenues(params),
  });
}
