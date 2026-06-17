// Billing-related constants for UI
import type { EntitlementsResponse } from "@/shared/api";

// List of all possible billing features (source of truth for UI checks)
export const BILLING_FEATURES = {
  PRIORITY_SUPPORT: "prioritySupport",
  MAX_USERS: "maxUsers",
  MAX_PROJECTS: "maxProjects",
} as const;

// Type helper for feature keys
export type BillingFeature = (typeof BILLING_FEATURES)[keyof typeof BILLING_FEATURES];

// Default features for personal workspace
export const DEFAULT_PERSONAL_WORKSPACE_FEATURES: EntitlementsResponse["features"] = {
  [BILLING_FEATURES.PRIORITY_SUPPORT]: false,
  [BILLING_FEATURES.MAX_USERS]: 1,
  [BILLING_FEATURES.MAX_PROJECTS]: 0, // 0 means unlimited
};

// Default features for free tenant plan
export const DEFAULT_FREE_TENANT_FEATURES: EntitlementsResponse["features"] = {
  [BILLING_FEATURES.PRIORITY_SUPPORT]: false,
  [BILLING_FEATURES.MAX_USERS]: 1,
  [BILLING_FEATURES.MAX_PROJECTS]: 1,
};
