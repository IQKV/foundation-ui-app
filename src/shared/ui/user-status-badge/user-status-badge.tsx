import { Badge } from "@mantine/core";
import { t } from "@lingui/core/macro";

// UserStatus is not a tenant-scoped concept in this app — define it locally.
type UserStatus = "ACTIVE" | "LOCKED" | "SUSPENDED" | "DELETED";

function getStatusConfig(status: UserStatus): { color: string; label: string } {
  const map: Record<UserStatus, { color: string; label: string }> = {
    ACTIVE: { color: "green", label: t`Active` },
    LOCKED: { color: "orange", label: t`Locked` },
    SUSPENDED: { color: "red", label: t`Suspended` },
    DELETED: { color: "gray", label: t`Deleted` },
  };
  return map[status] ?? { color: "gray", label: status };
}

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
}
