import { http, HttpResponse } from "msw";
import { MOCK_SIGN_IN_RESPONSE } from "../data/auth";
import { MOCK_TENANT_MEMBERSHIPS } from "../data/tenant";

/**
 * MSW handlers for authentication endpoints.
 *
 * Base path matches the Vite dev proxy config — in development the
 * httpClient uses baseURL "/api" so all requests are prefixed with /api.
 * The handlers use a relative pattern so they work with any origin.
 */
export const authHandlers = [
  // POST /v1/iam/users/tenants — tenant discovery (pre-sign-in step)
  http.post("*/v1/iam/users/tenants", () => {
    return HttpResponse.json(MOCK_TENANT_MEMBERSHIPS, { status: 200 });
  }),

  // POST /v1/iam/auth/signin — credential exchange
  http.post("*/v1/iam/auth/signin", () => {
    return HttpResponse.json(MOCK_SIGN_IN_RESPONSE, { status: 200 });
  }),

  // POST /v1/iam/auth/refresh — silent token refresh
  http.post("*/v1/iam/auth/refresh", () => {
    return HttpResponse.json(
      {
        accessToken: MOCK_SIGN_IN_RESPONSE.accessToken,
        refreshToken: MOCK_SIGN_IN_RESPONSE.refreshToken,
      },
      { status: 200 },
    );
  }),

  // POST /v1/iam/auth/signout — session termination
  http.post("*/v1/iam/auth/signout", () => {
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /v1/iam/auth/exchange — tenant context switch
  http.post("*/v1/iam/auth/exchange", () => {
    return HttpResponse.json(MOCK_SIGN_IN_RESPONSE, { status: 200 });
  }),

  // POST /v1/iam/users/password/forgot
  http.post("*/v1/iam/users/password/forgot", () => {
    // Always 200 — never reveals whether the email is registered
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/iam/users/password/reset
  http.post("*/v1/iam/users/password/reset", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/iam/auth/signup
  http.post("*/v1/iam/auth/signup", () => {
    return HttpResponse.json(
      {
        userId: "00000000-0000-0000-0000-000000000099",
        email: "new-user@demo.iqkv.com",
        tenantKey: "demo0099",
      },
      { status: 201 },
    );
  }),

  // GET /v1/iam/auth/signup/status/:tenantKey
  http.get("*/v1/iam/auth/signup/status/:tenantKey", () => {
    return HttpResponse.json({ tenantKey: "demo0099", tenantStatus: "ACTIVE" }, { status: 200 });
  }),
];
