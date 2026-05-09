import type { IamUserStatus } from "@/shared/api";

export interface EditUserFormValues {
  firstName: string;
  lastName: string;
  status: IamUserStatus;
}

export const STATUS_OPTIONS: { value: IamUserStatus; label: string }[] = [
  { value: "ACTIVE", label: "Active" },
  { value: "LOCKED", label: "Locked" },
  { value: "SUSPENDED", label: "Suspended" },
];
