import { useState } from "react";
import { useForm } from "@mantine/form";
import { z } from "zod";
import type { UseFormReturnType } from "@mantine/form";
import { t } from "@lingui/core/macro";
import { isAxiosError } from "axios";
import { authApi } from "@/shared/api/auth";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

function buildMagicLinkInitiateSchema() {
  return z.object({
    email: z
      .string()
      .min(1, t`Email is required`)
      .email(t`Enter a valid email address`),
    tenantKey: z.string().optional(),
  });
}

export type MagicLinkInitiateFormValues = z.infer<ReturnType<typeof buildMagicLinkInitiateSchema>>;

function mapHttpErrorToMessage(status: number): string {
  switch (status) {
    case 429:
      return t`Too many attempts. Please try again later.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

export interface UseMagicLinkInitiateReturn {
  form: UseFormReturnType<MagicLinkInitiateFormValues>;
  isLoading: boolean;
  isEmailSent: boolean;
  errorMessage: string | null;
  onSubmit: (values: MagicLinkInitiateFormValues) => Promise<void>;
  onResend: () => Promise<void>;
}

export function useMagicLinkInitiate(): UseMagicLinkInitiateReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [pendingValues, setPendingValues] = useState<MagicLinkInitiateFormValues | null>(null);

  const form = useForm<MagicLinkInitiateFormValues>({
    initialValues: { email: "", tenantKey: "" },
    validate: (values) => validateWithZod(buildMagicLinkInitiateSchema(), values),
  });

  const onSubmit = async (values: MagicLinkInitiateFormValues) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const request = {
        email: values.email,
        ...(values.tenantKey ? { tenantKey: values.tenantKey } : {}),
      };
      await authApi.initiateMagicLink(request);
      setPendingValues(values);
      setIsEmailSent(true);
    } catch (err: unknown) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapHttpErrorToMessage(status));
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    if (!pendingValues) return;
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const request = {
        email: pendingValues.email,
        ...(pendingValues.tenantKey ? { tenantKey: pendingValues.tenantKey } : {}),
      };
      await authApi.resendMagicLink(request);
    } catch (err: unknown) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapHttpErrorToMessage(status));
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, isEmailSent, errorMessage, onSubmit, onResend };
}
