import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";
import { z } from "zod";
import { t } from "@lingui/core/macro";
import type { UseFormReturn } from "react-hook-form";
import { iamApi } from "@/shared/api";
import type { InvitationPreview } from "@/shared/api";
import { setTokens } from "@/processes/session";

// ─── Phases ───────────────────────────────────────────────────────────────────

/**
 * preview  — loading the invitation details from the server
 * invalid  — token not found, expired, or revoked (terminal)
 * accept   — form ready for the user to fill in and submit
 * success  — accepted, tokens stored, about to navigate
 */
export type AcceptPhase = "preview" | "invalid" | "accept" | "success";

// ─── Form schema ──────────────────────────────────────────────────────────────

function buildAcceptSchema(requiresSignup: boolean) {
  if (requiresSignup) {
    return z.object({
      firstName: z
        .string()
        .min(1, t`First name is required`)
        .max(100),
      lastName: z
        .string()
        .min(1, t`Last name is required`)
        .max(100),
      password: z
        .string()
        .min(8, t`Password must be at least 8 characters`)
        .max(128, t`Password must be at most 128 characters`),
    });
  }

  return z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z
      .string()
      .min(8, t`Password must be at least 8 characters`)
      .max(128, t`Password must be at most 128 characters`),
  });
}

export interface AcceptFormValues {
  firstName?: string;
  lastName?: string;
  password: string;
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapAcceptError(status: number): string {
  switch (status) {
    case 400:
      return t`Invalid request. Please check your details and try again.`;
    case 401:
      return t`Incorrect password. Please try again.`;
    case 403:
      return t`Your account is locked or suspended.`;
    case 404:
      return t`This invitation link has expired or is no longer valid.`;
    case 409:
      return t`You are already a member of this organization.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UseAcceptInvitationReturn {
  phase: AcceptPhase;
  preview: InvitationPreview | null;
  form: UseFormReturn<AcceptFormValues>;
  isSubmitting: boolean;
  errorMessage: string | null;
  onSubmit: (values: AcceptFormValues) => Promise<void>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the two-phase invitation accept flow:
 *
 * Phase 1 (preview): fetches `GET /v1/iam/invitations/{token}` on mount.
 *   - 200 → transitions to `accept` phase, builds form schema from `requiresSignup`
 *   - 404/any error → transitions to `invalid` phase
 *
 * Phase 2 (accept): user fills in the form and submits.
 *   - `requiresSignup=true`  → firstName + lastName + password required
 *   - `requiresSignup=false` → password only (existing user identity check)
 *   - On success → stores token pair, navigates to `/dashboard`
 */
export function useAcceptInvitation(token: string): UseAcceptInvitationReturn {
  const navigate = useNavigate();

  const [phase, setPhase] = useState<AcceptPhase>("preview");
  const [preview, setPreview] = useState<InvitationPreview | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form schema is dynamic based on requiresSignup
  const [requiresSignup, setRequiresSignup] = useState(false);

  const form = useForm<AcceptFormValues>({
    resolver: zodResolver(buildAcceptSchema(requiresSignup)),
    defaultValues: { firstName: "", lastName: "", password: "" },
  });

  // ── Phase 1: fetch preview ─────────────────────────────────────────────────

  useEffect(() => {
    if (!token) {
      setPhase("invalid");
      return;
    }

    let cancelled = false;

    iamApi
      .previewInvitation(token)
      .then((data) => {
        if (cancelled) return;
        setPreview(data);
        setRequiresSignup(data.requiresSignup);
        form.reset({ firstName: "", lastName: "", password: "" });
        setPhase("accept");
      })
      .catch(() => {
        if (!cancelled) setPhase("invalid");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Update form resolver when requiresSignup changes
  useEffect(() => {
    form.clearErrors();
  }, [requiresSignup, form]);

  // ── Phase 2: submit accept form ────────────────────────────────────────────

  const onSubmit = async (values: AcceptFormValues): Promise<void> => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const result = await iamApi.acceptInvitation(token, {
        password: values.password,
        ...(preview?.requiresSignup
          ? { firstName: values.firstName, lastName: values.lastName }
          : {}),
      });

      setTokens(result.accessToken, result.refreshToken, result.tenantKey);
      setPhase("success");
      void navigate({ to: "/" });
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapAcceptError(status));
    } finally {
      setIsSubmitting(false);
    }
  };

  return { phase, preview, form, isSubmitting, errorMessage, onSubmit };
}
