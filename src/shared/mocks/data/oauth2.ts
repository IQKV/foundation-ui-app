import type { OAuth2LinkedIdentity } from "@/shared/api/oauth2";

export const MOCK_OAUTH2_ENABLED_PROVIDERS: string[] = ["google", "github", "microsoft"];

export const MOCK_OAUTH2_LINKED_IDENTITIES: OAuth2LinkedIdentity[] = [
  {
    provider: "github",
    displayName: "Demo User",
    email: "demo@iqkv.com",
    avatarUrl: null,
    linkedAt: "2026-06-30T00:00:00Z",
  },
];
