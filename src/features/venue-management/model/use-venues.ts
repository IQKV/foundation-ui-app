import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/shared/api";
import type { ListVenueParams } from "@/entities/venue";

/**
 * Tenant venue list — paginated, filterable by `search` (keyword) and `city`
 * (exact), sortable by `sortBy`/`sortDir`. Tenant scope comes from the JWT.
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
      params.sortBy ?? "",
      params.sortDir ?? "",
    ],
    queryFn: () => catalogApi.listVenues(params),
  });
}
