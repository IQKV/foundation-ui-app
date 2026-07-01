import { httpClient } from "./http-client";

export interface OAuth2EnabledProvidersResponse {
  providers: string[];
}

export interface OAuth2LinkedIdentity {
  provider: string;
  displayName: string | null;
  email: string | null;
  avatarUrl: string | null;
  linkedAt: string | null;
}

export interface OAuth2AuthorizationUrlResponse {
  url: string;
}

const joinUrl = (base: string, path: string): string => {
  if (!base) return path;
  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
};

export const resolveApiUrl = (path: string): string => {
  const baseUrl = String(httpClient.defaults.baseURL ?? "");
  return joinUrl(baseUrl, path);
};

export const oauth2Api = {
  listEnabledProviders: (): Promise<string[]> =>
    httpClient
      .get<OAuth2EnabledProvidersResponse>("/v1/iam/auth/oauth2/providers")
      .then((r) => r.data.providers),

  listLinkedIdentities: (): Promise<OAuth2LinkedIdentity[]> =>
    httpClient.get<OAuth2LinkedIdentity[]>("/v1/iam/auth/oauth2/identities").then((r) => r.data),

  unlinkProvider: (provider: string): Promise<void> =>
    httpClient
      .delete(`/v1/iam/auth/oauth2/link/${encodeURIComponent(provider)}`)
      .then(() => undefined),

  getLinkAuthorizationUrl: (provider: string): Promise<string> =>
    httpClient
      .get<OAuth2AuthorizationUrlResponse>(
        `/v1/iam/auth/oauth2/link/${encodeURIComponent(provider)}/authorize-url`,
      )
      .then((r) => r.data.url),
};

export const buildOAuth2AuthorizeUrl = (provider: string, tenantKey?: string): string => {
  const query = new URLSearchParams({ provider });
  if (tenantKey) query.set("tenantKey", tenantKey);
  return resolveApiUrl(`/v1/iam/auth/oauth2/authorize?${query.toString()}`);
};
