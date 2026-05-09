/**
 * In-memory session store.
 *
 * The access token lives here and NOWHERE else — no localStorage, no sessionStorage,
 * no non-httpOnly cookie. This makes it immune to XSS token theft.
 *
 * The refresh token is stored in an httpOnly, Secure, SameSite=Strict cookie managed
 * entirely by the server. The Axios interceptor uses it transparently on 401.
 */
import { create } from "zustand";

interface SessionState {
  /** RS256 access token — in memory only, cleared on page reload. */
  accessToken: string | null;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  setAccessToken: (token) => set({ accessToken: token }),
  clearSession: () => set({ accessToken: null }),
}));

/** Read the current access token outside of React (e.g. in Axios interceptors). */
export const getAccessToken = (): string | null => useSessionStore.getState().accessToken;

export const setAccessToken = (token: string): void =>
  useSessionStore.getState().setAccessToken(token);

export const clearSession = (): void => useSessionStore.getState().clearSession();
