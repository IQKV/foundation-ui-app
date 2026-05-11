/**
 * Session store with persistent refresh token.
 *
 * - Access token: in-memory only (cleared on page reload for security)
 * - Refresh token: persisted in sessionStorage (survives page reload, cleared on tab close)
 *
 * This allows the app to restore the session after page refresh by using the
 * persisted refresh token to obtain a new access token, while keeping the
 * short-lived access token in memory only for better XSS protection.
 */
import { create } from "zustand";

const REFRESH_TOKEN_KEY = "iqkv_refresh_token";

interface SessionState {
  /** RS256 access token — in memory only, cleared on page reload. */
  accessToken: string | null;
  /** Refresh token — persisted in sessionStorage, cleared on tab close. */
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

// Helper to safely read from sessionStorage
const loadRefreshToken = (): string | null => {
  try {
    return sessionStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

// Helper to safely write to sessionStorage
const saveRefreshToken = (token: string): void => {
  try {
    sessionStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch {
    // Ignore storage errors (e.g., quota exceeded, private browsing)
  }
};

// Helper to safely remove from sessionStorage
const removeRefreshToken = (): void => {
  try {
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  } catch {
    // Ignore storage errors
  }
};

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: loadRefreshToken(), // Load persisted refresh token on init
  setTokens: (accessToken, refreshToken) => {
    saveRefreshToken(refreshToken);
    set({ accessToken, refreshToken });
  },
  setAccessToken: (token) => set({ accessToken: token }),
  clearSession: () => {
    removeRefreshToken();
    set({ accessToken: null, refreshToken: null });
  },
}));

/** Read the current access token outside of React (e.g. in Axios interceptors). */
export const getAccessToken = (): string | null => useSessionStore.getState().accessToken;

/** Read the current refresh token outside of React (e.g. in Axios interceptors). */
export const getRefreshToken = (): string | null => useSessionStore.getState().refreshToken;

export const setTokens = (accessToken: string, refreshToken: string): void =>
  useSessionStore.getState().setTokens(accessToken, refreshToken);

export const setAccessToken = (token: string): void =>
  useSessionStore.getState().setAccessToken(token);

export const clearSession = (): void => useSessionStore.getState().clearSession();
