import type { IamTenantStatus } from "@/shared/api";
import { t } from "@lingui/core/macro";

export interface EditTenantFormValues {
  name: string;
  status: IamTenantStatus;
}

/** Returns translated status options. Call inside a component or hook. */
export function getStatusOptions(): { value: IamTenantStatus; label: string }[] {
  return [
    { value: "ACTIVE", label: t`Active` },
    { value: "SUSPENDED", label: t`Suspended` },
  ];
}

/** @deprecated Use `getStatusOptions()` for translated labels. */
export const STATUS_OPTIONS: { value: IamTenantStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
];
