import { createContext, useContext, ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { EntitlementsResponse, PlanFeatures } from "@/shared/api";
import { useEntitlements } from "./use-entitlements";
import { useSession } from "@/processes/session/use-session";
import { DEFAULT_PERSONAL_WORKSPACE_FEATURES, DEFAULT_FREE_TENANT_FEATURES } from "@/app/config";

interface EntitlementsContextType {
  entitlements: UseQueryResult<EntitlementsResponse, Error>;
  hasFeature: (feature: keyof PlanFeatures) => boolean;
  getFeatureValue: {
    (feature: "prioritySupport"): boolean;
    (feature: "maxUsers" | "maxProjects"): number;
  };
  isActive: boolean;
  planCode: string | null;
}

const EntitlementsContext = createContext<EntitlementsContextType | null>(null);

interface EntitlementsProviderProps {
  children: ReactNode;
}

export function EntitlementsProvider({ children }: EntitlementsProviderProps) {
  const entitlements = useEntitlements();
  const { isPersonalWorkspace } = useSession();

  const hasFeature = (feature: keyof PlanFeatures): boolean => {
    if (isPersonalWorkspace) {
      const value = DEFAULT_PERSONAL_WORKSPACE_FEATURES[feature];
      return typeof value === "boolean" ? value : value > 0;
    }
    const features = entitlements.data?.features || DEFAULT_FREE_TENANT_FEATURES;
    const value = features[feature];
    return typeof value === "boolean" ? value : value > 0;
  };

  const getFeatureValue = (feature: keyof PlanFeatures): any => {
    if (isPersonalWorkspace) {
      return DEFAULT_PERSONAL_WORKSPACE_FEATURES[feature];
    }
    const features = entitlements.data?.features || DEFAULT_FREE_TENANT_FEATURES;
    return features[feature];
  };

  const isActive = true; // Free plan is always active
  const planCode = isPersonalWorkspace ? "personal" : entitlements.data?.planCode || "free";

  const value: EntitlementsContextType = {
    entitlements,
    hasFeature,
    getFeatureValue,
    isActive,
    planCode,
  };

  return <EntitlementsContext.Provider value={value}>{children}</EntitlementsContext.Provider>;
}

export function useEntitlementsContext(): EntitlementsContextType {
  const context = useContext(EntitlementsContext);
  if (!context) {
    throw new Error("useEntitlementsContext must be used within an EntitlementsProvider");
  }
  return context;
}

/**
 * Hook to check if a specific feature is available.
 * Returns false if no subscription or feature is not available.
 */
export function useHasFeature(feature: keyof PlanFeatures): boolean {
  const { hasFeature } = useEntitlementsContext();
  return hasFeature(feature);
}

/**
 * Hook to get the value of a specific feature.
 * Returns the feature value or default (false for boolean, 0 for number).
 */
export function useFeatureValue(feature: "prioritySupport"): boolean;
export function useFeatureValue(feature: "maxUsers" | "maxProjects"): number;
export function useFeatureValue(feature: keyof PlanFeatures): any {
  const { getFeatureValue } = useEntitlementsContext();
  return getFeatureValue(feature as any);
}
