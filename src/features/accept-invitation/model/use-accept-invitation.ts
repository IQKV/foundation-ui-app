import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "@mantine/form";
import { isAxiosError } from "axios";
import { z } from "zod";
import { t } from "@lingui/core/macro";
import type { UseFormReturnType } from "@mantine/form";
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

function buildAcceptSchema() {
  return z.object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    password: z
      .string()
      .min(8, t`Password must be at least 8 characters`)
      .max(128, t`Password must be at most 128 characters`),
  });
}

export type AcceptFormValues = z.infer<ReturnType<typeof buildAcceptSchema>>;

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
  form: UseFormReturnType<AcceptFormValues>;
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
    initialValues: { firstName: "", lastName: "", password: "" },
    validate: (values) => {
      const errors: Record<string, string> = {};

      // Validate using Zod schema first
      const zodResult = buildAcceptSchema().safeParse(values);
      if (!zodResult.success) {
        zodResult.error.issues.forEach((issue) => {
          const path = issue.path.join(".");
          errors[path] = issue.message;
        });
      }

      // Conditionally validate first and last name if requiresSignup is true
      if (requiresSignup) {
        if (!values.firstName || values.firstName.trim().length < 1) {
          errors.firstName = t`First name is required`;
        }
        if (!values.lastName || values.lastName.trim().length < 1) {
          errors.lastName = t`Last name is required`;
        }
      }

      return errors;
    },
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
        form.setValues({ firstName: "", lastName: "", password: "" });
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

      // Accepting an invitation always scopes the session to a regular organization
      // (invitations cannot be issued for personal workspaces).
      setTokens(result.accessToken, result.refreshToken, result.tenantKey, false);
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
