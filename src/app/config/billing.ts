// Billing-related constants for UI
import type { PlanFeatures } from "@/shared/api";

// Feature codes — these are the map keys in PlanFeatures.features (snake_case, matches YAML)
export const BILLING_FEATURES = {
  PRIORITY_SUPPORT: "priority_support",
  ADVANCED_ANALYTICS: "advanced_analytics",
} as const;

// Type helper for feature map keys
export type BillingFeatureCode = (typeof BILLING_FEATURES)[keyof typeof BILLING_FEATURES];

// Default features for personal workspace
export const DEFAULT_PERSONAL_WORKSPACE_FEATURES: PlanFeatures = {
  maxUsers: 1,
  maxProjects: 0, // 0 means unlimited
  features: {},
};

// Default features for free tenant plan
export const DEFAULT_FREE_TENANT_FEATURES: PlanFeatures = {
  maxUsers: 1,
  maxProjects: 1,
  features: {},
};
