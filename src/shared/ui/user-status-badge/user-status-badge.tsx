import { Badge } from "@mantine/core";
import type { UserStatus } from "@/shared/api";

const statusConfig: Record<UserStatus, { color: string; label: string }> = {
  ACTIVE: { color: "green", label: "Active" },
  LOCKED: { color: "orange", label: "Locked" },
  SUSPENDED: { color: "red", label: "Suspended" },
  DELETED: { color: "gray", label: "Deleted" },
};

interface UserStatusBadgeProps {
  status: UserStatus;
}

export function UserStatusBadge({ status }: UserStatusBadgeProps) {
  const config = statusConfig[status] ?? { color: "gray", label: status };
  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
}
