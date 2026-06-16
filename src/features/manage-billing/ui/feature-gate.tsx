import { ReactNode } from "react";
import { Alert } from "@mantine/core";
import { IconLock } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import type { EntitlementsResponse } from "@/shared/api";
import { useEntitlementsContext } from "../model/entitlements-context";

interface FeatureGateProps {
  feature: keyof EntitlementsResponse["features"];
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
}

/**
 * Feature gate component that conditionally renders children based on plan entitlements.
 *
 * @param feature - The feature to check (prioritySupport, maxUsers, maxProjects)
 * @param children - Content to render when feature is available
 * @param fallback - Custom fallback content when feature is not available
 * @param showUpgradePrompt - Whether to show default upgrade prompt as fallback
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradePrompt = false,
}: FeatureGateProps) {
  const { hasFeature, isActive } = useEntitlementsContext();

  // If no active subscription, show upgrade prompt
  if (!isActive && showUpgradePrompt) {
    return (
      fallback || (
        <Alert icon={<IconLock size={16} />} color="blue" variant="light">
          <Trans>
            This feature requires an active subscription. Please upgrade your plan to access this
            functionality.
          </Trans>
        </Alert>
      )
    );
  }

  // If feature is available, render children
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Feature not available, render fallback or nothing
  return <>{fallback || null}</>;
}
