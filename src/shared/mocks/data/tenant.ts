import type { Tenant } from "@/entities/tenant";
import type { TenantMembershipSummary } from "@/shared/api/auth";

export const MOCK_TENANT_KEY = "demo0001";

export const MOCK_TENANT: Tenant = {
  id: "00000000-0000-0000-0000-000000000002",
  tenantKey: MOCK_TENANT_KEY,
  name: "Demo Organisation",
  status: "ACTIVE",
  isPersonal: false,
  isInternal: false,
  createdAt: "2026-05-17T10:00:00.000Z",
  updatedAt: "2026-05-17T10:00:00.000Z",
};

export const MOCK_TENANT_MEMBERSHIPS: TenantMembershipSummary[] = [
  {
    tenantKey: MOCK_TENANT_KEY,
    tenantName: "Demo Organisation",
    membershipStatus: "ACTIVE",
    authorities: ["TENANT_OWNER"],
    isPersonal: false,
    isInternal: false,
  },
];
