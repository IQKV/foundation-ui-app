import { http, HttpResponse } from "msw";
import { MOCK_USER, MOCK_TENANT_MEMBER } from "../data/user";

export const userHandlers = [
  // GET /v1/iam/users/me — current user profile
  http.get("*/v1/iam/users/me", () => {
    return HttpResponse.json(MOCK_USER, { status: 200 });
  }),

  // PATCH /v1/iam/users/me — update profile
  http.patch("*/v1/iam/users/me", async ({ request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        ...MOCK_USER,
        ...body,
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // GET /v1/iam/users/me/memberships
  http.get("*/v1/iam/users/me/memberships", () => {
    return HttpResponse.json(
      [
        {
          tenantKey: "demo0001",
          tenantName: "Demo Organisation",
          status: "ACTIVE",
          authorities: ["TENANT_OWNER"],
          isPersonal: false,
          isInternal: false,
        },
      ],
      { status: 200 },
    );
  }),

  // POST /v1/iam/users/me/password — change password
  http.post("*/v1/iam/users/me/password", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/iam/users/me/profile/complete
  http.post("*/v1/iam/users/me/profile/complete", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // POST /v1/iam/users/me/onboarding/complete
  http.post("*/v1/iam/users/me/onboarding/complete", () => {
    return new HttpResponse(null, { status: 200 });
  }),

  // GET /v1/iam/tenants/:tenantKey/members — list members
  http.get("*/v1/iam/tenants/:tenantKey/members", () => {
    return HttpResponse.json(
      {
        content: [MOCK_TENANT_MEMBER],
        totalElements: 1,
        totalPages: 1,
        page: 0,
        size: 20,
      },
      { status: 200 },
    );
  }),

  // GET /v1/iam/users/notifications/unread/count
  http.get("*/v1/iam/users/notifications/unread/count", () => {
    return HttpResponse.json({ count: 0 }, { status: 200 });
  }),

  // GET /v1/iam/users/notifications
  http.get("*/v1/iam/users/notifications", () => {
    return HttpResponse.json({ notifications: [], totalCount: 0, unreadCount: 0 }, { status: 200 });
  }),
];
