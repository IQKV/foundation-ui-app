/**
 * In-memory session store.
 *
 * Both access and refresh tokens live here in memory only — no localStorage,
 * no sessionStorage, no cookies. This makes them immune to XSS token theft.
 * Tokens are cleared on page reload, requiring re-authentication.
 */
import { create } from "zustand";

interface SessionState {
  /** RS256 access token — in memory only, cleared on page reload. */
  accessToken: string | null;
  /** Refresh token — in memory only, cleared on page reload. */
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: null,
  setTokens: (accessToken, refreshToken) => set({ accessToken, refreshToken }),
  setAccessToken: (token) => set({ accessToken: token }),
  clearSession: () => set({ accessToken: null, refreshToken: null }),
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
