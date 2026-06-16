import { createContext, useContext, ReactNode } from "react";
import type { UseQueryResult } from "@tanstack/react-query";
import type { EntitlementsResponse } from "@/shared/api";
import { useEntitlements } from "./use-entitlements";

interface EntitlementsContextType {
  entitlements: UseQueryResult<EntitlementsResponse, Error>;
  hasFeature: (feature: keyof EntitlementsResponse["features"]) => boolean;
  getFeatureValue: (feature: keyof EntitlementsResponse["features"]) => boolean | number;
  isActive: boolean;
  planCode: string | null;
}

const EntitlementsContext = createContext<EntitlementsContextType | null>(null);

interface EntitlementsProviderProps {
  children: ReactNode;
}

export function EntitlementsProvider({ children }: EntitlementsProviderProps) {
  const entitlements = useEntitlements();

  const hasFeature = (feature: keyof EntitlementsResponse["features"]): boolean => {
    if (!entitlements.data?.features) return false;
    const value = entitlements.data.features[feature];
    return typeof value === "boolean" ? value : value > 0;
  };

  const getFeatureValue = (feature: keyof EntitlementsResponse["features"]): boolean | number => {
    if (!entitlements.data?.features) {
      return typeof entitlements.data?.features?.[feature] === "boolean" ? false : 0;
    }
    return entitlements.data.features[feature];
  };

  const isActive = entitlements.data?.status === "active";
  const planCode = entitlements.data?.planCode || null;

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
export function useHasFeature(feature: keyof EntitlementsResponse["features"]): boolean {
  const { hasFeature } = useEntitlementsContext();
  return hasFeature(feature);
}

/**
 * Hook to get the value of a specific feature.
 * Returns the feature value or default (false for boolean, 0 for number).
 */
export function useFeatureValue(feature: keyof EntitlementsResponse["features"]): boolean | number {
  const { getFeatureValue } = useEntitlementsContext();
  return getFeatureValue(feature);
}
