import { t } from "@lingui/core/macro";
import { z } from "zod";

export function buildEditProfileSchema() {
  return z.object({
    firstName: z.string().min(1, t`First name is required`),
    lastName: z.string().min(1, t`Last name is required`),
    /** BCP 47 locale tag (e.g. "en-US"). Null means "leave unchanged". */
    locale: z.string().nullable(),
  });
}

export type EditProfileFormValues = z.infer<ReturnType<typeof buildEditProfileSchema>>;
