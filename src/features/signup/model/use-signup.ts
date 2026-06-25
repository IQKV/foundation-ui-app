import { useCallback, useRef, useState } from "react";
import { useForm } from "@mantine/form";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { z } from "zod";
import type { UseFormReturnType } from "@mantine/form";
import { t } from "@lingui/core/macro";
import { signupApi } from "@/shared/api/signup";
import { authApi } from "@/shared/api/auth";
import { setTokens } from "@/processes/session";
import { validateWithZod } from "@/shared/lib/zod-form-validation";

// ─── Schema factory ───────────────────────────────────────────────────────────

function buildSignupSchema() {
  return z.object({
    firstName: z
      .string()
      .min(1, t`First name is required`)
      .max(100, t`First name is too long`),
    lastName: z
      .string()
      .min(1, t`Last name is required`)
      .max(100, t`Last name is too long`),
    email: z
      .string()
      .min(1, t`Email is required`)
      .email(t`Enter a valid email address`),
    password: z
      .string()
      .min(8, t`Password must be at least 8 characters`)
      .max(128, t`Password must be at most 128 characters`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/,
        t`Password must contain uppercase, lowercase, a number, and a special character`,
      ),
  });
}

type SignupSchema = ReturnType<typeof buildSignupSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignupFormValues = z.infer<SignupSchema>;

/**
 * Two phases of the onboarding flow:
 * - form:         Step 1 — account creation form
 * - verify-email: Step 2 — email verification prompt (user can proceed to app)
 */
export type SignupPhase = "form" | "verify-email";

export interface UseSignupReturn {
  form: UseFormReturnType<SignupFormValues>;
  phase: SignupPhase;
  isLoading: boolean;
  errorMessage: string | null;
  /** The email submitted — used in the verify-email step */
  submittedEmail: string;
  /** The platform tenantKey returned by signup */
  tenantKey: string;
  onSubmit: (values: SignupFormValues) => Promise<void>;
  /** Proceed to the app from the verify-email step (auto sign-in) */
  onEnterWorkspace: () => Promise<void>;
  /** Resend the verification email */
  onResendVerification: () => Promise<void>;
  resendCooldown: number; // seconds remaining before resend is allowed again
}

// ─── Error mapping ────────────────────────────────────────────────────────────

function mapSignupError(status: number): string {
  switch (status) {
    case 409:
      return t`An account with this email already exists.`;
    case 429:
      return t`Too many requests. Please wait a moment before trying again.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the 2-phase signup onboarding flow as a state machine.
 *
 * Credentials are held in a ref (never written to storage) so the auto
 * sign-in in Phase 2 can use them without re-prompting the user.
 *
 * Phase 1 (form):
 *   - Validates and submits `POST /auth/signup`
 *   - On 201 → transitions to Phase 2
 *
 * Phase 2 (verify-email):
 *   - Shows email verification prompt
 *   - "Enter workspace" auto-signs in using stored credentials
 *   - "Resend" calls `POST /users/email/resend-verification` with 60s cooldown
 */
export function useSignup(): UseSignupReturn {
  const [phase, setPhase] = useState<SignupPhase>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [tenantKey, setTenantKey] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Credentials held in memory only — never persisted
  const credentialsRef = useRef<{ email: string; password: string } | null>(null);
  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    validate: (values) => validateWithZod(buildSignupSchema(), values),
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  // ── Phase 1: submit form ───────────────────────────────────────────────────

  const onSubmit = async (values: SignupFormValues): Promise<void> => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await signupApi.register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });

      // Store credentials in memory for auto sign-in in Phase 2
      credentialsRef.current = { email: values.email, password: values.password };
      setSubmittedEmail(values.email);
      setTenantKey(response.tenantKey);

      setPhase("verify-email");
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapSignupError(status));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phase 2: enter workspace (auto sign-in) ────────────────────────────────

  const onEnterWorkspace = async (): Promise<void> => {
    const creds = credentialsRef.current;
    if (!creds || !tenantKey) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await authApi.signIn(
        { email: creds.email, password: creds.password },
        tenantKey,
      );
      // Session store resolves isPersonalWorkspace for the active rollout mode.
      setTokens(response.accessToken, response.refreshToken, response.tenantKey, true);
      void navigate({ to: "/" });
    } catch {
      // Sign-in failed — redirect to sign-in page with the email pre-filled
      void navigate({ to: "/sign-in" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phase 2: resend verification email ────────────────────────────────────

  const onResendVerification = async (): Promise<void> => {
    if (resendCooldown > 0 || !submittedEmail) return;

    try {
      await import("@/shared/api/http-client").then(({ httpClient }) =>
        httpClient.post("/v1/iam/users/email/resend-verification", { email: submittedEmail }),
      );
    } catch {
      // Silently ignore — rate limit errors are handled by the cooldown
    }

    // Start 60s cooldown regardless of API result
    setResendCooldown(60);
    const tick = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(tick);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return {
    form,
    phase,
    isLoading,
    errorMessage,
    submittedEmail,
    tenantKey,
    onSubmit,
    onEnterWorkspace,
    onResendVerification,
    resendCooldown,
  };
}
