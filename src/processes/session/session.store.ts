/**
 * Session store for tenant user sessions.
 *
 * - Access token: in-memory only (cleared on page reload for security)
 * - Refresh token: persisted in sessionStorage (survives page reload, cleared on tab close)
 * - Tenant key: persisted in sessionStorage alongside the refresh token
 *
 * This allows the app to restore the session after page refresh by using the
 * persisted refresh token + tenant key to obtain a new access token, while
 * keeping the short-lived access token in memory only for better XSS protection.
 */
import { create } from "zustand";

const REFRESH_TOKEN_KEY = "iqkv_refresh_token";
const TENANT_KEY_KEY = "iqkv_tenant_key";

interface SessionState {
  /** RS256 access token — in memory only, cleared on page reload. */
  accessToken: string | null;
  /** Refresh token — persisted in sessionStorage, cleared on tab close. */
  refreshToken: string | null;
  /** Active tenant key — persisted in sessionStorage alongside the refresh token. */
  tenantKey: string | null;
  setTokens: (accessToken: string, refreshToken: string, tenantKey: string) => void;
  setAccessToken: (token: string) => void;
  clearSession: () => void;
}

// ─── sessionStorage helpers ───────────────────────────────────────────────────

const loadFromStorage = (key: string): string | null => {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
};

const saveToStorage = (key: string, value: string): void => {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (e.g., quota exceeded, private browsing)
  }
};

const removeFromStorage = (key: string): void => {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Ignore storage errors
  }
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: loadFromStorage(REFRESH_TOKEN_KEY),
  tenantKey: loadFromStorage(TENANT_KEY_KEY),

  setTokens: (accessToken, refreshToken, tenantKey) => {
    saveToStorage(REFRESH_TOKEN_KEY, refreshToken);
    saveToStorage(TENANT_KEY_KEY, tenantKey);
    set({ accessToken, refreshToken, tenantKey });
  },

  setAccessToken: (token) => set({ accessToken: token }),

  clearSession: () => {
    removeFromStorage(REFRESH_TOKEN_KEY);
    removeFromStorage(TENANT_KEY_KEY);
    set({ accessToken: null, refreshToken: null, tenantKey: null });
  },
}));

// ─── Imperative accessors (for use outside React, e.g. Axios interceptors) ───

export const getAccessToken = (): string | null => useSessionStore.getState().accessToken;
export const getRefreshToken = (): string | null => useSessionStore.getState().refreshToken;
export const getTenantKey = (): string | null => useSessionStore.getState().tenantKey;

export const setTokens = (accessToken: string, refreshToken: string, tenantKey: string): void =>
  useSessionStore.getState().setTokens(accessToken, refreshToken, tenantKey);

export const setAccessToken = (token: string): void =>
  useSessionStore.getState().setAccessToken(token);

export const clearSession = (): void => useSessionStore.getState().clearSession();
