import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import { t } from "@lingui/core/macro";
import { passwordResetApi } from "@/shared/api/password-reset";

// ─── Schema factory ───────────────────────────────────────────────────────────

function buildForgotPasswordSchema() {
  return z.object({
    email: z
      .string()
      .min(1, t`Email is required`)
      .email(t`Enter a valid email address`),
  });
}

type ForgotPasswordSchema = ReturnType<typeof buildForgotPasswordSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ForgotPasswordFormValues = z.infer<ForgotPasswordSchema>;

export interface UseForgotPasswordReturn {
  form: UseFormReturn<ForgotPasswordFormValues>;
  isLoading: boolean;
  isSubmitted: boolean;
  errorMessage: string | null;
  onSubmit: (values: ForgotPasswordFormValues) => Promise<void>;
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapHttpErrorToMessage(status: number): string {
  switch (status) {
    case 429:
      return t`Too many requests. Please wait a moment before trying again.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates the forgot-password form logic.
 *
 * On success, `isSubmitted` is set to true and the UI switches to a
 * confirmation message. The API always returns 200 regardless of whether the
 * email is registered (anti-enumeration), so we never show a "not found" error.
 */
export function useForgotPassword(): UseForgotPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(buildForgotPasswordSchema()),
    defaultValues: { email: "" },
  });

  const onSubmit = async (values: ForgotPasswordFormValues): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await passwordResetApi.forgot({ email: values.email });
      setIsSubmitted(true);
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapHttpErrorToMessage(status));
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, isSubmitted, errorMessage, onSubmit };
}
