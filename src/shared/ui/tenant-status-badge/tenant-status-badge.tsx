import { Badge } from "@mantine/core";
import { t } from "@lingui/core/macro";
import type { TenantStatus } from "@/shared/api";

function getStatusConfig(status: TenantStatus): { color: string; label: string } {
  const map: Record<TenantStatus, { color: string; label: string }> = {
    ACTIVE: { color: "green", label: t`Active` },
    SUSPENDED: { color: "red", label: t`Suspended` },
    DELETED: { color: "gray", label: t`Deleted` },
  };
  return map[status] ?? { color: "gray", label: status };
}

interface TenantStatusBadgeProps {
  status: TenantStatus;
}

export function TenantStatusBadge({ status }: TenantStatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
}
