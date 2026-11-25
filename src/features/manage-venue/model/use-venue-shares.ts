import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { catalogApi, iamApi } from "@/shared/api";
import type { VenueShareRequest } from "@/shared/api";

/** Grants on a venue — any workspace member may read the list. */
export function useVenueShares(venueId: string) {
  return useQuery({
    queryKey: ["tenant", "venue", venueId, "shares"],
    queryFn: () => catalogApi.listVenueShares(venueId),
    enabled: venueId.length > 0,
  });
}

/**
 * Candidate grantees — the current workspace's members. There is no
 * cross-workspace user search, so shares are limited to people already in this
 * workspace (shortcut: non-member sharing is not supported, upgrade if a
 * platform-user search endpoint lands).
 */
export function useShareCandidates(tenantKey: string | null) {
  return useQuery({
    queryKey: ["tenant", "members", tenantKey, "share-candidates"],
    queryFn: () => iamApi.listMembers(tenantKey as string, { size: 100 }),
    enabled: !!tenantKey,
  });
}

/** Resolve display names for the users a venue is shared with. */
export function useShareProfiles(userIds: string[]) {
  const ids = [...userIds].sort();
  return useQuery({
    queryKey: ["iam", "user-profiles", ids.join(",")],
    queryFn: () => iamApi.getUserProfiles(ids),
    enabled: ids.length > 0,
  });
}

function useInvalidateShares(venueId: string) {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ["tenant", "venue", venueId, "shares"] });
}

export function useAddVenueShare(venueId: string) {
  const invalidate = useInvalidateShares(venueId);
  return useMutation({
    mutationFn: (data: VenueShareRequest) => catalogApi.addVenueShare(venueId, data),
    onSuccess: () => void invalidate(),
  });
}

export function useUpdateVenueShareRole(venueId: string) {
  const invalidate = useInvalidateShares(venueId);
  return useMutation({
    mutationFn: (data: VenueShareRequest) =>
      catalogApi.updateVenueShareRole(venueId, data.sharedWithUserId, data),
    onSuccess: () => void invalidate(),
  });
}

export function useRemoveVenueShare(venueId: string) {
  const invalidate = useInvalidateShares(venueId);
  return useMutation({
    mutationFn: (userId: string) => catalogApi.removeVenueShare(venueId, userId),
    onSuccess: () => void invalidate(),
  });
}
