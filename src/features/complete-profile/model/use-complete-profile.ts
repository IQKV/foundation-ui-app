import { useState } from "react";
import { useForm } from "@mantine/form";
import type { UseFormReturnType } from "@mantine/form";
import { isAxiosError } from "axios";
import { t } from "@lingui/core/macro";
import { iamApi, authApi } from "@/shared/api";
import { setTokens, getIsPersonalWorkspace, useSession } from "@/processes/session";
import { dynamicActivateLocale } from "@/shared/locales";
import { validateWithZod } from "@/shared/lib/zod-form-validation";
import { buildCompleteProfileSchema } from "./types";
import type { CompleteProfileFormValues } from "./types";

export type { CompleteProfileFormValues };

function mapHttpErrorToMessage(status: number): string {
  switch (status) {
    case 400:
      return t`Please check the form and try again.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

export interface UseCompleteProfileReturn {
  form: UseFormReturnType<CompleteProfileFormValues>;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (values: CompleteProfileFormValues) => Promise<void>;
}

/**
 * Drives the profile completion flow for users created without a name
 * (magic-link auto-signup).
 *
 * Steps:
 *  1. PATCH /v1/iam/users/me — persist first name, last name, locale
 *  2. POST /v1/iam/users/me/onboarding/complete — flip the flag
 *  3. POST /v1/iam/auth/exchange — issue a fresh JWT with updated claims
 *     (firstName, lastName, onboarding_completed: true)
 *
 * The caller is responsible for navigating away on completion — the hook
 * sets `isComplete` to true and the caller can react via `useEffect`.
 */
export function useCompleteProfile(): UseCompleteProfileReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { tenantKey } = useSession();

  const form = useForm<CompleteProfileFormValues>({
    initialValues: { firstName: "", lastName: "", locale: null },
    validate: (values) => validateWithZod(buildCompleteProfileSchema(), values),
  });

  const onSubmit = async (values: CompleteProfileFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // 1. Persist the name (and optional locale)
      await iamApi.updateMe({
        firstName: values.firstName,
        lastName: values.lastName,
        locale: values.locale ?? undefined,
      });

      // 2. Activate locale in Lingui immediately if the user chose one
      if (values.locale) {
        await dynamicActivateLocale(values.locale);
        document.cookie = `locale=${values.locale};path=/;max-age=31536000;SameSite=Lax`;
      }

      // 3. Mark profile as completed
      await iamApi.completeProfile();

      // 4. Exchange for a fresh token so the JWT reflects the new name and
      //    onboarding_completed: true — the _app guard will let the user through.
      const fresh = await authApi.exchangeTenant(tenantKey!);
      setTokens(fresh.accessToken, fresh.refreshToken, fresh.tenantKey, getIsPersonalWorkspace());
    } catch (err: unknown) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapHttpErrorToMessage(status));
      setIsLoading(false);
    }
    // Note: we don't set isLoading=false on success because the parent page
    // immediately navigates away — keeping the spinner avoids a flash.
  };

  return { form, isLoading, errorMessage, onSubmit };
}
