import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { authApi } from "@/shared/api/auth";
import { clearSession } from "@/processes/session";

export interface UseSignOutReturn {
  /** True while the sign-out API call is in flight. */
  isLoading: boolean;
  /** Trigger sign-out: calls the API (fire-and-forget), clears the session, and redirects to /sign-in. */
  signOut: () => Promise<void>;
}

/**
 * Encapsulates the explicit sign-out action.
 *
 * Always calls `clearSession()` and redirects to `/sign-in` regardless of
 * whether the `POST /v1/iam/auth/signout` API call succeeds or fails
 * (Requirements 6.3, 6.5).
 */
export function useSignOut(): UseSignOutReturn {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authApi.signOut();
    } catch {
      // Fire-and-forget: ignore API errors — session is cleared regardless.
    } finally {
      setIsLoading(false);
      clearSession();
      void navigate({ to: "/sign-in" });
    }
  };

  return { isLoading, signOut };
}
