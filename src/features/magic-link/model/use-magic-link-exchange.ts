import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { isAxiosError } from "axios";
import { t } from "@lingui/core/macro";
import { authApi } from "@/shared/api/auth";
import { setTokens } from "@/processes/session";

function mapHttpErrorToMessage(status: number): string {
  switch (status) {
    case 400:
    case 404:
      return t`Magic link is invalid or has expired. Please request a new one.`;
    default:
      return t`Sign-in failed. Please try again.`;
  }
}

export interface UseMagicLinkExchangeReturn {
  isLoading: boolean;
  errorMessage: string | null;
  isSuccess: boolean;
  exchangeToken: (token: string, redirectTo?: string) => Promise<void>;
}

export function useMagicLinkExchange(): UseMagicLinkExchangeReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const exchangeToken = async (token: string, redirectTo?: string) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await authApi.exchangeMagicLink({ token });
      setTokens(
        response.accessToken,
        response.refreshToken,
        response.tenantKey,
        true, // Platform tenant is personal
      );
      setIsSuccess(true);
      setTimeout(() => {
        void navigate({ to: redirectTo ?? "/" });
      }, 1500);
    } catch (err: unknown) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      setErrorMessage(mapHttpErrorToMessage(status));
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, errorMessage, isSuccess, exchangeToken };
}
