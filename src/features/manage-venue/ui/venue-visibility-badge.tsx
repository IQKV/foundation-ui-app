import { Badge } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { IconLock, IconWorld } from "@tabler/icons-react";
import type { VenueVisibility } from "@/entities/venue";

interface VenueVisibilityBadgeProps {
  visibility: VenueVisibility;
  size?: "xs" | "sm";
}

/** Public / private marker for a venue. */
export function VenueVisibilityBadge({ visibility, size = "sm" }: VenueVisibilityBadgeProps) {
  if (visibility === "PRIVATE") {
    return (
      <Badge size={size} color="grape" variant="light" leftSection={<IconLock size={10} />}>
        <Trans>Private</Trans>
      </Badge>
    );
  }
  return (
    <Badge size={size} color="gray" variant="light" leftSection={<IconWorld size={10} />}>
      <Trans>Public</Trans>
    </Badge>
  );
}
