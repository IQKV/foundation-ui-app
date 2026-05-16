import { useCallback, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { z } from "zod";
import type { UseFormReturn } from "react-hook-form";
import { t } from "@lingui/core/macro";
import { signupApi } from "@/shared/api/signup";
import { authApi } from "@/shared/api/auth";
import { setTokens } from "@/processes/session";

// ─── Constants ────────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 1500;
const POLL_TIMEOUT_MS = 30_000;

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
    tenantName: z
      .string()
      .max(100, t`Organization name is too long`)
      .optional(),
  });
}

type SignupSchema = ReturnType<typeof buildSignupSchema>;

// ─── Types ────────────────────────────────────────────────────────────────────

export type SignupFormValues = z.infer<SignupSchema>;

/**
 * Three phases of the onboarding flow:
 * - form:         Step 1 — account creation form
 * - provisioning: Step 2 — animated wait while tenant is being set up
 * - verify-email: Step 3 — email verification prompt (user can proceed to app)
 */
export type SignupPhase = "form" | "provisioning" | "verify-email";

export interface UseSignupReturn {
  form: UseFormReturn<SignupFormValues>;
  phase: SignupPhase;
  isLoading: boolean;
  /** True when provisioning has timed out (>30s) but not yet failed */
  isProvisioningTimeout: boolean;
  errorMessage: string | null;
  /** The email submitted — used in the verify-email step */
  submittedEmail: string;
  /** The tenantKey returned by signup — used for polling */
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
      return t`An account with this email or organization name already exists.`;
    case 429:
      return t`Too many requests. Please wait a moment before trying again.`;
    default:
      return t`Something went wrong. Please try again.`;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * Manages the full 3-phase signup onboarding flow as a state machine.
 *
 * Credentials are held in a ref (never written to storage) so the auto
 * sign-in in Phase 3 can use them without re-prompting the user.
 *
 * Phase 1 (form):
 *   - Validates and submits `POST /auth/signup`
 *   - On 201 → transitions to Phase 2 and starts polling
 *
 * Phase 2 (provisioning):
 *   - Polls `GET /auth/signup/status/:tenantKey` every 1.5s
 *   - On ACTIVE → transitions to Phase 3
 *   - On PROVISIONING_FAILED → shows error
 *   - After 30s → sets isProvisioningTimeout = true (soft timeout, keeps polling)
 *
 * Phase 3 (verify-email):
 *   - Shows email verification prompt
 *   - "Enter workspace" auto-signs in using stored credentials
 *   - "Resend" calls `POST /users/email/resend-verification` with 60s cooldown
 */
export function useSignup(): UseSignupReturn {
  const [phase, setPhase] = useState<SignupPhase>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [isProvisioningTimeout, setIsProvisioningTimeout] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [tenantKey, setTenantKey] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Credentials held in memory only — never persisted
  const credentialsRef = useRef<{ email: string; password: string } | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const navigate = useNavigate();

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(buildSignupSchema()),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      tenantName: "",
    },
  });

  // ── Polling ────────────────────────────────────────────────────────────────

  const stopPolling = useCallback(() => {
    if (pollTimerRef.current) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    if (timeoutTimerRef.current) {
      clearTimeout(timeoutTimerRef.current);
      timeoutTimerRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (key: string) => {
      // Soft timeout — show "taking longer than expected" message but keep polling
      timeoutTimerRef.current = setTimeout(() => {
        setIsProvisioningTimeout(true);
      }, POLL_TIMEOUT_MS);

      pollTimerRef.current = setInterval(async () => {
        try {
          const { tenantStatus } = await signupApi.getProvisioningStatus(key);

          if (tenantStatus === "ACTIVE") {
            stopPolling();
            setPhase("verify-email");
          } else if (tenantStatus === "PROVISIONING_FAILED") {
            stopPolling();
            setErrorMessage(t`Workspace setup failed. Please try again or contact support.`);
            setPhase("form");
          }
          // PROVISIONING → keep polling
        } catch {
          // Network error during polling — keep trying silently
        }
      }, POLL_INTERVAL_MS);
    },
    [stopPolling],
  );

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
        tenantName: values.tenantName?.trim() || undefined,
      });

      // Store credentials in memory for auto sign-in in Phase 3
      credentialsRef.current = { email: values.email, password: values.password };
      setSubmittedEmail(values.email);
      setTenantKey(response.tenantKey);

      if (response.tenantStatus === "ACTIVE") {
        // Provisioning completed synchronously (unlikely but handle it)
        setPhase("verify-email");
      } else {
        setPhase("provisioning");
        startPolling(response.tenantKey);
      }
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapSignupError(status));
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phase 3: enter workspace (auto sign-in) ────────────────────────────────

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
      setTokens(response.accessToken, response.refreshToken, response.tenantKey);
      void navigate({ to: "/" });
    } catch {
      // Sign-in failed — redirect to sign-in page with the email pre-filled
      void navigate({ to: "/sign-in" });
    } finally {
      setIsLoading(false);
    }
  };

  // ── Phase 3: resend verification email ────────────────────────────────────

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
    isProvisioningTimeout,
    errorMessage,
    submittedEmail,
    tenantKey,
    onSubmit,
    onEnterWorkspace,
    onResendVerification,
    resendCooldown,
  };
}
