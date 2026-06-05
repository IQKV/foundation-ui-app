import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import { notifications } from "@mantine/notifications";
import { t } from "@lingui/core/macro";
import { iamApi } from "@/shared/api/iam";
import { authApi } from "@/shared/api/auth";
import { setTokens, useSession } from "@/processes/session";
import type { UserMembership } from "@/shared/api/iam";

export const MY_MEMBERSHIPS_KEY = ["my-memberships"] as const;

export interface UseTenantSwitcherReturn {
  /** All memberships for the current user. */
  memberships: UserMembership[];
  /** The membership matching the active tenant key. */
  activeMembership: UserMembership | undefined;
  /** Memberships other than the currently active one. */
  otherMemberships: UserMembership[];
  /** True while memberships are loading. */
  isLoading: boolean;
  /** True while a token exchange is in flight. */
  isSwitching: boolean;
  /** The tenantKey currently being switched to (for per-item spinners). */
  switchingTo: string | null;
  /** Trigger a tenant switch. */
  switchTo: (tenantKey: string) => Promise<void>;
}

export function useTenantSwitcher(): UseTenantSwitcherReturn {
  const { tenantKey, isAuthenticated } = useSession();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [switchingTo, setSwitchingTo] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: MY_MEMBERSHIPS_KEY,
    queryFn: () => iamApi.listMyMemberships(),
    enabled: isAuthenticated,
    staleTime: 60_000,
  });

  const memberships = data ?? [];
  const activeMembership = memberships.find((m) => m.tenantKey === tenantKey);
  const otherMemberships = memberships.filter((m) => m.tenantKey !== tenantKey);

  const switchTo = async (targetTenantKey: string): Promise<void> => {
    if (switchingTo) return;
    setSwitchingTo(targetTenantKey);
    try {
      const response = await authApi.exchangeTenant(targetTenantKey);
      const targetMembership = memberships.find((m) => m.tenantKey === targetTenantKey);
      setTokens(
        response.accessToken,
        response.refreshToken,
        response.tenantKey,
        targetMembership?.isPersonal ?? false,
      );
      // Invalidate all cached data — it belongs to the previous tenant context.
      await queryClient.invalidateQueries();
      void navigate({ to: "/" });
    } catch (err) {
      const status = isAxiosError(err) ? (err.response?.status ?? 0) : 0;
      const message =
        status === 403
          ? t`You no longer have access to this organization.`
          : t`Could not switch organization. Please try again.`;
      notifications.show({ color: "red", message });
    } finally {
      setSwitchingTo(null);
    }
  };

  return {
    memberships,
    activeMembership,
    otherMemberships,
    isLoading,
    isSwitching: switchingTo !== null,
    switchingTo,
    switchTo,
  };
}
