const STORAGE_KEY = "iqkv_oauth2_post_auth_redirect";

export interface OAuth2PostAuthRedirect {
  to: string;
}

export const storePostAuthRedirect = (to: string): void => {
  try {
    const value: OAuth2PostAuthRedirect = { to };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {}
};

export const consumePostAuthRedirect = (): string | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as OAuth2PostAuthRedirect;
    if (!parsed?.to || typeof parsed.to !== "string") return null;
    return parsed.to;
  } catch {
    return null;
  }
};
