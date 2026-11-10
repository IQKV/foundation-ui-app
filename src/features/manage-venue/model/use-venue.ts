import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/shared/api";

/**
 * Tenant venue detail — read-only. Tenant scope comes from the JWT.
 */
export function useVenue(id: string) {
  return useQuery({
    queryKey: ["tenant", "venue", id],
    queryFn: () => catalogApi.getVenue(id),
    enabled: id.length > 0,
  });
}
