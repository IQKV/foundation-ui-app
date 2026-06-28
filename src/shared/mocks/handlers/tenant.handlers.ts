import { http, HttpResponse } from "msw";
import { MOCK_TENANT } from "../data/tenant";

export const tenantHandlers = [
  // GET /v1/iam/tenants/:tenantKey
  http.get("*/v1/iam/tenants/:tenantKey", ({ params }) => {
    return HttpResponse.json(
      { ...MOCK_TENANT, tenantKey: params["tenantKey"] ?? MOCK_TENANT.tenantKey },
      { status: 200 },
    );
  }),

  // PATCH /v1/iam/tenants/:tenantKey
  http.patch("*/v1/iam/tenants/:tenantKey", async ({ params, request }) => {
    const body = (await request.json()) as Record<string, unknown>;
    return HttpResponse.json(
      {
        ...MOCK_TENANT,
        tenantKey: params["tenantKey"] ?? MOCK_TENANT.tenantKey,
        ...body,
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }),

  // GET /v1/iam/tenants/:tenantKey/members/stats
  http.get("*/v1/iam/tenants/:tenantKey/members/stats", ({ params }) => {
    return HttpResponse.json(
      {
        tenantKey: params["tenantKey"],
        totalMembers: 1,
        activeMembers: 1,
        lockedMembers: 0,
        suspendedMembers: 0,
        emailVerifiedCount: 1,
        signupSeries: [],
        periodFrom: "2026-01-01T00:00:00.000Z",
        periodTo: new Date().toISOString(),
        granularity: "day",
      },
      { status: 200 },
    );
  }),

  // GET /v1/iam/tenants/:tenantKey/members/count
  http.get("*/v1/iam/tenants/:tenantKey/members/count", ({ params }) => {
    return HttpResponse.json({ tenantKey: params["tenantKey"], count: 1 }, { status: 200 });
  }),

  // GET /v1/iam/tenants/:tenantKey/invitations
  http.get("*/v1/iam/tenants/:tenantKey/invitations", () => {
    return HttpResponse.json([], { status: 200 });
  }),

  // GET /v1/iam/locales
  http.get("*/v1/iam/locales", () => {
    return HttpResponse.json(
      [
        { code: "en-US", name: "English (US)", nativeName: "English", isDefault: true },
        { code: "ru-RU", name: "Russian", nativeName: "Русский", isDefault: false },
        { code: "it-IT", name: "Italian", nativeName: "Italiano", isDefault: false },
      ],
      { status: 200 },
    );
  }),
];
