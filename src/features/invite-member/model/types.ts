import type { InvitationAuthority } from "@/shared/api";
import { t } from "@lingui/core/macro";
import { z } from "zod";

export function buildSendInvitationSchema() {
  return z.object({
    email: z.string().email(t`Must be a valid email address`),
    authority: z.string() as z.ZodType<InvitationAuthority>,
  });
}

export type SendInvitationFormValues = z.infer<ReturnType<typeof buildSendInvitationSchema>>;

/** Returns translated authority options. Call inside a component or hook. */
export function getAuthorityOptions(): { value: InvitationAuthority; label: string }[] {
  return [
    { value: "MEMBER", label: t`Member` },
    { value: "ADMIN", label: t`Admin` },
  ];
}
