import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import { t } from "@lingui/core/macro";
import { iamApi } from "@/shared/api/iam";
import { authApi } from "@/shared/api/auth";
import { setTokens } from "@/processes/session";

// ─── Schema factory ───────────────────────────────────────────────────────────

function buildCreateOrganizationSchema() {
  return z.object({
    name: z
      .string()
      .min(1, t`Organization name is required`)
      .max(100, t`Organization name is too long`),
  });
}

type CreateOrganizationSchema = ReturnType<typeof buildCreateOrganizationSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateOrganizationFormValues = z.infer<CreateOrganizationSchema>;

export interface UseCreateOrganizationReturn {
  form: UseFormReturn<CreateOrganizationFormValues>;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (values: CreateOrganizationFormValues) => Promise<void>;
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapCreateOrganizationError(status: number): string {
  switch (status) {
    case 409:
      return t`An organization with this name already exists.`;
    case 429:
      return t`Too many requests. Please wait a moment before trying again.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the organization creation flow.
 */
export function useCreateOrganization(): UseCreateOrganizationReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(buildCreateOrganizationSchema()),
    defaultValues: {
      name: "",
    },
  });

  // ── Submit form ───────────────────────────────────────────────────────

  const onSubmit = async (values: CreateOrganizationFormValues): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const createdTenant = await iamApi.createTenant({
        name: values.name,
      });

      // Exchange the current token for one in the new tenant.
      // Newly created organizations are never personal workspaces.
      const response = await authApi.exchangeTenant(createdTenant.tenantKey);
      setTokens(response.accessToken, response.refreshToken, response.tenantKey, false);
      void navigate({ to: "/" });
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapCreateOrganizationError(status));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    form,
    isLoading,
    errorMessage,
    onSubmit,
  };
}
