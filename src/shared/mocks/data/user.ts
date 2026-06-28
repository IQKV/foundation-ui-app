import type { UserProfile, TenantMember } from "@/entities/user";

/**
 * Demo user fixture — mirrors the seed data in
 * 20260517000004-demo-e2e-users.xml so MSW and real-API tests share
 * the same user identity.
 */
export const MOCK_USER: UserProfile = {
  id: "00000000-0000-0000-0000-000000000001",
  email: "margaret.hayes@demo.iqkv.com",
  firstName: "Margaret",
  lastName: "Hayes",
  status: "ACTIVE",
  emailVerified: true,
  locale: "en-US",
  avatarUrl: null,
  firstSignInAt: "2026-05-17T10:00:00.000Z",
  onboardingCompleted: true,
  profileCompleted: true,
  organizations: ["Demo Organisation"],
  membershipAuthorities: ["TENANT_OWNER"],
  createdAt: "2026-05-17T10:00:00.000Z",
  updatedAt: "2026-05-17T10:00:00.000Z",
};

export const MOCK_TENANT_MEMBER: TenantMember = {
  id: MOCK_USER.id,
  email: MOCK_USER.email,
  firstName: MOCK_USER.firstName,
  lastName: MOCK_USER.lastName,
  emailVerified: true,
  membershipStatus: "ACTIVE",
  tenantAuthorities: ["TENANT_OWNER"],
  createdAt: "2026-05-17T10:00:00.000Z",
  updatedAt: "2026-05-17T10:00:00.000Z",
};
