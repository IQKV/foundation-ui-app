import type { TenantMembershipSummary } from "@/shared/api/auth";

/** Hidden platform tenant used in SINGLE_TENANT (B2C) deployments. */
export const PLATFORM_TENANT_KEY = "platform";

const readRolloutMode = (): string => {
  const w =
    typeof window !== "undefined"
      ? (window as unknown as Record<string, string | undefined>)
      : undefined;
  return (
    w?.VITE_ROLLOUT_MODE ??
    (import.meta.env.VITE_ROLLOUT_MODE as string | undefined) ??
    "MULTI_TENANT"
  );
};

export const isSingleTenantRollout = (): boolean => readRolloutMode() === "SINGLE_TENANT";

/**
 * In SINGLE_TENANT (B2C) there is only the platform tenant — treat it as the
 * user's personal workspace. In MULTI_TENANT, pass through the backend flag.
 *
 * Organization UI is gated separately via `isMultiTenantMode`.
 */
export function resolvePersonalWorkspaceFlag(isPersonal: boolean): boolean {
  return isSingleTenantRollout() ? true : isPersonal;
}

/** Pick the platform/internal tenant for auto sign-in in SINGLE_TENANT mode. */
export function pickPlatformMembership(
  memberships: TenantMembershipSummary[],
): TenantMembershipSummary | null {
  if (memberships.length === 0) return null;
  return (
    memberships.find((m) => m.tenantKey === PLATFORM_TENANT_KEY) ??
    memberships.find((m) => m.isInternal) ??
    memberships[0]
  );
}
