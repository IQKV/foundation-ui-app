import { Badge } from "@mantine/core";
import { t } from "@lingui/core/macro";
import type { IamTenantStatus } from "@/shared/api";

function getStatusConfig(status: IamTenantStatus): { color: string; label: string } {
  const map: Record<IamTenantStatus, { color: string; label: string }> = {
    ACTIVE: { color: "green", label: t`Active` },
    SUSPENDED: { color: "red", label: t`Suspended` },
    DELETED: { color: "gray", label: t`Deleted` },
  };
  return map[status] ?? { color: "gray", label: status };
}

interface TenantStatusBadgeProps {
  status: IamTenantStatus;
}

export function TenantStatusBadge({ status }: TenantStatusBadgeProps) {
  const config = getStatusConfig(status);
  return (
    <Badge color={config.color} variant="light" size="sm">
      {config.label}
    </Badge>
  );
}
