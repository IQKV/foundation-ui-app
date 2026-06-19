import { useState } from "react";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { z } from "zod";
import type { UseFormReturnType } from "@mantine/form";
import { t } from "@lingui/core/macro";
import { passwordResetApi } from "@/shared/api/password-reset";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

// ─── Schema factory ───────────────────────────────────────────────────────────

function buildResetPasswordSchema() {
  return z
    .object({
      newPassword: z
        .string()
        .min(8, t`Password must be at least 8 characters`)
        .max(128, t`Password must be at most 128 characters`)
        .regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
          t`Password must contain uppercase, lowercase, a number, and a special character`,
        ),
      confirmPassword: z.string().min(1, t`Please confirm your password`),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
      message: t`Passwords do not match`,
      path: ["confirmPassword"],
    });
}

type ResetPasswordSchema = ReturnType<typeof buildResetPasswordSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type ResetPasswordFormValues = z.infer<ResetPasswordSchema>;

export interface UseResetPasswordReturn {
  form: UseFormReturnType<ResetPasswordFormValues>;
  isLoading: boolean;
  isSuccess: boolean;
  errorMessage: string | null;
  onSubmit: (values: ResetPasswordFormValues) => Promise<void>;
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapHttpErrorToMessage(status: number): string {
  switch (status) {
    case 400:
      return t`This reset link is invalid or has expired. Please request a new one.`;
    case 429:
      return t`Too many requests. Please wait a moment before trying again.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates the reset-password form logic.
 *
 * Accepts the reset token (from the URL query param) and submits it along with
 * the new password to `POST /v1/iam/users/password/reset`.
 *
 * On success, `isSuccess` is set to true and the UI shows a confirmation with
 * a link back to sign-in. On 400, shows an "invalid/expired token" message.
 *
 * @param token - The single-use reset token from the email link URL.
 */
export function useResetPassword(token: string): UseResetPasswordReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<ResetPasswordFormValues>({
    validate: (values) => validateWithZod(buildResetPasswordSchema(), values),
    initialValues: { newPassword: "", confirmPassword: "" },
  });

  const onSubmit = async (values: ResetPasswordFormValues): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await passwordResetApi.reset({ token, newPassword: values.newPassword });
      setIsSuccess(true);
      // Auto-redirect to sign-in after 3 seconds so the user sees the success message.
      setTimeout(() => {
        void navigate({ to: "/sign-in" });
      }, 3000);
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapHttpErrorToMessage(status));
    } finally {
      setIsLoading(false);
    }
  };

  return { form, isLoading, isSuccess, errorMessage, onSubmit };
}
