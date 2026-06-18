import { createContext, useContext, ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { EntitlementsResponse, PlanFeatures } from "@/shared/api";
import { useEntitlements } from "./use-entitlements";
import { useSession } from "@/processes/session/use-session";
import { DEFAULT_PERSONAL_WORKSPACE_FEATURES, DEFAULT_FREE_TENANT_FEATURES } from "@/app/config";

interface EntitlementsContextType {
  entitlements: UseQueryResult<EntitlementsResponse, Error>;
  /**
   * Returns true if the named feature code exists in the features map with value "true".
   * For quota fields (maxUsers, maxProjects) use getQuota() instead.
   */
  hasFeature: (featureCode: string) => boolean;
  /**
   * Returns the value of a typed quota field.
   */
  getQuota: (field: "maxUsers" | "maxProjects") => number;
  /** @deprecated use hasFeature / getQuota */
  getFeatureValue: (feature: "maxUsers" | "maxProjects") => number;
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

  const resolvedFeatures = (): PlanFeatures => {
    if (isPersonalWorkspace) return DEFAULT_PERSONAL_WORKSPACE_FEATURES;
    return entitlements.data?.features || DEFAULT_FREE_TENANT_FEATURES;
  };

  const hasFeature = (featureCode: string): boolean => {
    const f = resolvedFeatures();
    const entry = f.features[featureCode];
    return entry !== undefined && entry.value.toLowerCase() === "true";
  };

  const getQuota = (field: "maxUsers" | "maxProjects"): number => {
    return resolvedFeatures()[field];
  };

  // kept for backwards compatibility
  const getFeatureValue = (feature: "maxUsers" | "maxProjects"): number => getQuota(feature);

  const isActive = true; // Free plan is always active
  const planCode = isPersonalWorkspace ? "personal" : entitlements.data?.planCode || "free";

  const value: EntitlementsContextType = {
    entitlements,
    hasFeature,
    getQuota,
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
 * Hook to check if a specific feature code is available (enabled in the features map).
 */
export function useHasFeature(featureCode: string): boolean {
  const { hasFeature } = useEntitlementsContext();
  return hasFeature(featureCode);
}

/**
 * Hook to get the value of a quota field (maxUsers or maxProjects).
 */
export function useQuota(field: "maxUsers" | "maxProjects"): number {
  const { getQuota } = useEntitlementsContext();
  return getQuota(field);
}

/** @deprecated use useHasFeature / useQuota */
export function useFeatureValue(feature: "maxUsers" | "maxProjects"): number {
  const { getQuota } = useEntitlementsContext();
  return getQuota(feature);
}
