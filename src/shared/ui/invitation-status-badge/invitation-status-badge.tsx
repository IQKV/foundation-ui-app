import { Badge } from "@mantine/core";
import { t } from "@lingui/core/macro";
import type { InvitationStatus } from "@/shared/api";

function getStatusConfig(status: InvitationStatus): { color: string; label: string } {
  const map: Record<InvitationStatus, { color: string; label: string }> = {
    PENDING: { color: "blue", label: t`Pending` },
    ACCEPTED: { color: "green", label: t`Accepted` },
    REVOKED: { color: "gray", label: t`Revoked` },
    EXPIRED: { color: "orange", label: t`Expired` },
  };
  return map[status] ?? { color: "gray", label: status };
}

interface InvitationStatusBadgeProps {
  status: InvitationStatus;
}

export function InvitationStatusBadge({ status }: InvitationStatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
}
