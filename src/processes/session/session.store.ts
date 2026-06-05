/**
 * Session store for tenant user sessions.
 *
 * - Access token:          in-memory only (cleared on page reload for security)
 * - Refresh token:         persisted in sessionStorage (cleared on tab close)
 * - Tenant key:            persisted in sessionStorage alongside the refresh token
 * - isPersonalWorkspace:   persisted in sessionStorage — derived from the backend
 *                          `TenantMembershipSummary.isPersonal` flag at sign-in time
 *                          (which maps to `Tenant.isInternal` on the server).
 *                          The JWT carries no workspace-type claim, so this flag is
 *                          the only reliable source of truth across page reloads.
 *
 * This allows the app to restore the session after page refresh by using the
 * persisted refresh token + tenant key to obtain a new access token, while
 * keeping the short-lived access token in memory only for better XSS protection.
 */
import { create } from "zustand";

const REFRESH_TOKEN_KEY = "iqkv_refresh_token";
const TENANT_KEY_KEY = "iqkv_tenant_key";
const IS_PERSONAL_WORKSPACE_KEY = "iqkv_is_personal_workspace";

interface SessionState {
  /** RS256 access token — in memory only, cleared on page reload. */
  accessToken: string | null;
  /** Refresh token — persisted in sessionStorage, cleared on tab close. */
  refreshToken: string | null;
  /** Active tenant key — persisted in sessionStorage alongside the refresh token. */
  tenantKey: string | null;
  /**
   * True when the active tenant is the user's personal workspace
   * (backend: `Tenant.isInternal = true`).
   * Persisted in sessionStorage so it survives page reload without an extra API call.
   */
  isPersonalWorkspace: boolean;
  setTokens: (
    accessToken: string,
    refreshToken: string,
    tenantKey: string,
    isPersonalWorkspace: boolean,
  ) => void;
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
  isPersonalWorkspace: loadFromStorage(IS_PERSONAL_WORKSPACE_KEY) === "true",

  setTokens: (accessToken, refreshToken, tenantKey, isPersonalWorkspace) => {
    saveToStorage(REFRESH_TOKEN_KEY, refreshToken);
    saveToStorage(TENANT_KEY_KEY, tenantKey);
    saveToStorage(IS_PERSONAL_WORKSPACE_KEY, String(isPersonalWorkspace));
    set({ accessToken, refreshToken, tenantKey, isPersonalWorkspace });
  },

  setAccessToken: (token) => set({ accessToken: token }),

  clearSession: () => {
    removeFromStorage(REFRESH_TOKEN_KEY);
    removeFromStorage(TENANT_KEY_KEY);
    removeFromStorage(IS_PERSONAL_WORKSPACE_KEY);
    set({ accessToken: null, refreshToken: null, tenantKey: null, isPersonalWorkspace: false });
  },
}));

// ─── Imperative accessors (for use outside React, e.g. Axios interceptors) ───

export const getAccessToken = (): string | null => useSessionStore.getState().accessToken;
export const getRefreshToken = (): string | null => useSessionStore.getState().refreshToken;
export const getTenantKey = (): string | null => useSessionStore.getState().tenantKey;
export const getIsPersonalWorkspace = (): boolean => useSessionStore.getState().isPersonalWorkspace;

export const setTokens = (
  accessToken: string,
  refreshToken: string,
  tenantKey: string,
  isPersonalWorkspace: boolean,
): void =>
  useSessionStore.getState().setTokens(accessToken, refreshToken, tenantKey, isPersonalWorkspace);

export const setAccessToken = (token: string): void =>
  useSessionStore.getState().setAccessToken(token);

export const clearSession = (): void => useSessionStore.getState().clearSession();
