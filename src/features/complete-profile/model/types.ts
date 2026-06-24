import { t } from "@lingui/core/macro";
import { z } from "zod";

export function buildCompleteProfileSchema() {
  return z.object({
    firstName: z
      .string()
      .min(1, t`First name is required`)
      .max(100),
    lastName: z
      .string()
      .min(1, t`Last name is required`)
      .max(100),
    /** BCP 47 locale tag (e.g. "en-US"). Null means "leave unchanged". */
    locale: z.string().nullable(),
  });
}

export type CompleteProfileFormValues = z.infer<ReturnType<typeof buildCompleteProfileSchema>>;
