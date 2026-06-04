import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import { t } from "@lingui/core/macro";
import { authApi } from "@/shared/api/auth";
import type { TenantMembershipSummary } from "@/shared/api/auth";
import { setTokens } from "@/processes/session";

// ─── Schema factory ───────────────────────────────────────────────────────────

function buildSignInSchema() {
  return z.object({
    email: z
      .string()
      .min(1, t`Email is required`)
      .email(t`Enter a valid email address`),
    password: z.string().min(1, t`Password is required`),
  });
}

type SignInSchema = ReturnType<typeof buildSignInSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignInFormValues = z.infer<SignInSchema>;

/** Sign-in flow has two steps: credentials → tenant selection (if multi-tenant). */
export type SignInStep = "credentials" | "tenant-select";

export interface UseSignInReturn {
  form: UseFormReturn<SignInFormValues>;
  step: SignInStep;
  tenants: TenantMembershipSummary[];
  isLoading: boolean;
  errorMessage: string | null;
  /** Step 1: validate credentials and discover tenants. */
  onSubmitCredentials: (values: SignInFormValues) => Promise<void>;
  /** Step 2: complete sign-in for the selected tenant. */
  onSelectTenant: (tenantKey: string) => Promise<void>;
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapHttpErrorToMessage(status: number): string {
  switch (status) {
    case 401:
      return t`Invalid email or password`;
    case 403:
      return t`Your account is not active or has been suspended`;
    case 429:
      return t`Too many sign-in attempts. Please try again later.`;
    default:
      return t`Sign-in failed. Please try again.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Encapsulates the two-step tenant sign-in flow:
 *
 * 1. Credentials step — calls `POST /users/tenants` to discover which tenants
 *    the user belongs to. If only one tenant, skips to step 2 automatically.
 * 2. Tenant selection step — calls `POST /auth/signin` with the chosen tenant
 *    key, stores the resulting tokens, and navigates to the app.
 *
 * @param redirectTo - Path to navigate to after successful sign-in.
 */
export function useSignIn(redirectTo?: string): UseSignInReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step, setStep] = useState<SignInStep>("credentials");
  const [tenants, setTenants] = useState<TenantMembershipSummary[]>([]);
  const [pendingCredentials, setPendingCredentials] = useState<SignInFormValues | null>(null);
  const navigate = useNavigate();

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(buildSignInSchema()),
    defaultValues: { email: "", password: "" },
  });

  const completeSignIn = async (credentials: SignInFormValues, tenantKey: string) => {
    console.log("[use-sign-in] completeSignIn called with tenantKey:", tenantKey);
    const response = await authApi.signIn(
      { email: credentials.email, password: credentials.password },
      tenantKey,
    );
    console.log("[use-sign-in] authApi.signIn response:", response);
    setTokens(response.accessToken, response.refreshToken, response.tenantKey);
    console.log("[use-sign-in] setTokens called with tenantKey:", response.tenantKey);
    void navigate({ to: redirectTo ?? "/" });
  };

  const onSubmitCredentials = async (values: SignInFormValues): Promise<void> => {
    console.log("[use-sign-in] onSubmitCredentials called with values:", values);
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const memberships = await authApi.listUserTenants(values.email, values.password);
      console.log("[use-sign-in] listUserTenants returned:", memberships);

      if (memberships.length === 0) {
        setErrorMessage(t`No active tenant memberships found for this account`);
        return;
      }

      if (memberships.length === 1) {
        // Single tenant — skip selection step and sign in directly.
        await completeSignIn(values, memberships[0].tenantKey);
        return;
      }

      // Multiple tenants — show tenant picker.
      setPendingCredentials(values);
      setTenants(memberships);
      setStep("tenant-select");
    } catch (err: unknown) {
      console.error("[use-sign-in] onSubmitCredentials error:", err);
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      console.error("[use-sign-in] onSubmitCredentials error status:", status);
      console.error(
        "[use-sign-in] onSubmitCredentials error response:",
        isAxiosError(err) ? err.response : null,
      );
      setErrorMessage(mapHttpErrorToMessage(status));
      if (status === 401) {
        form.resetField("password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onSelectTenant = async (tenantKey: string): Promise<void> => {
    console.log("[use-sign-in] onSelectTenant called with tenantKey:", tenantKey);
    if (!pendingCredentials) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      await completeSignIn(pendingCredentials, tenantKey);
    } catch (err: unknown) {
      console.error("[use-sign-in] onSelectTenant error:", err);
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      console.error("[use-sign-in] onSelectTenant error status:", status);
      console.error(
        "[use-sign-in] onSelectTenant error response:",
        isAxiosError(err) ? err.response : null,
      );
      setErrorMessage(mapHttpErrorToMessage(status));
    } finally {
      setIsLoading(false);
    }
  };

  return { form, step, tenants, isLoading, errorMessage, onSubmitCredentials, onSelectTenant };
}
