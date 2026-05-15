import type { InvitationAuthority } from "@/shared/api";
import { t } from "@lingui/core/macro";

export interface SendInvitationFormValues {
  email: string;
  authority: InvitationAuthority;
}

/** Returns translated authority options. Call inside a component or hook. */
export function getAuthorityOptions(): { value: InvitationAuthority; label: string }[] {
  return [
    { value: "MEMBER", label: t`Member` },
    { value: "ADMIN", label: t`Admin` },
  ];
}
