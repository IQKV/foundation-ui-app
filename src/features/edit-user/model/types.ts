import type { IamUserStatus } from "@/shared/api";
import { t } from "@lingui/core/macro";

export interface EditUserFormValues {
  firstName: string;
  lastName: string;
  status: IamUserStatus;
}

/** Returns translated status options. Call inside a component or hook. */
export function getStatusOptions(): { value: IamUserStatus; label: string }[] {
  return [
    { value: "ACTIVE", label: t`Active` },
    { value: "LOCKED", label: t`Locked` },
    { value: "SUSPENDED", label: t`Suspended` },
  ];
}

/** @deprecated Use `getStatusOptions()` for translated labels. */
export const STATUS_OPTIONS: { value: IamUserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "LOCKED", label: "Locked" },
  { value: "SUSPENDED", label: "Suspended" },
];
