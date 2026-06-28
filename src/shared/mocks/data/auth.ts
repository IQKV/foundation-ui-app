import type { SignInResponse } from "@/shared/api/auth";
import { MOCK_TENANT_KEY } from "./tenant";

export const MOCK_ACCESS_TOKEN =
  "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDEiLCJ0ZW5hbnRLZXkiOiJkZW1vMDAwMSIsImV4cCI6OTk5OTk5OTk5OX0.mock";
export const MOCK_REFRESH_TOKEN = "mock-refresh-token-value";

export const MOCK_SIGN_IN_RESPONSE: SignInResponse = {
  accessToken: MOCK_ACCESS_TOKEN,
  refreshToken: MOCK_REFRESH_TOKEN,
  tenantKey: MOCK_TENANT_KEY,
};
