import { type ComponentType } from "react";
import { type httpClient } from "@/shared/api/http-client";
import { type queryClient } from "@/shared/lib/query-client";
import { type i18n } from "@lingui/core";

// Addon Manifest definition
export interface AddonManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author?: string;
  requires?: {
    core?: string;
    features?: string[];
  };
  permissions?: {
    features?: string[];
    roles?: string[];
  };
}

// Navigation Extension Point Types
export interface NavItemExtension {
  id: string;
  label: string;
  to: string;
  icon: ComponentType<{ size?: number }>;
  order?: number;
  section?: "workspace" | "account";
  roles?: string[];
  feature?: string;
}

export interface NavigationExtensionPoint {
  registerNavItem(item: NavItemExtension): void;
  getNavItems(section: "workspace" | "account"): NavItemExtension[];
}

// Widget Extension Point Types
export interface WidgetExtension {
  id: string;
  component: ComponentType<any>;
  location: "dashboard";
  order?: number;
}

export interface WidgetExtensionPoint {
  registerWidget(widget: WidgetExtension): void;
  getWidgets(location: "dashboard"): WidgetExtension[];
}

// Addon Context
export interface AddonContext {
  httpClient: typeof httpClient;
  queryClient: typeof queryClient;
  session: {
    useSession: typeof import("@/processes/session").useSession;
    getAccessToken: typeof import("@/processes/session").getAccessToken;
    getTenantKey: typeof import("@/processes/session").getTenantKey;
  };
  i18n: typeof i18n;
  extensions: {
    navigation: NavigationExtensionPoint;
    widgets: WidgetExtensionPoint;
  };
}

// Addon Definition
export interface Addon {
  manifest: AddonManifest;
  initialize?: (context: AddonContext) => void | Promise<void>;
  cleanup?: () => void;
  routes?: Array<{
    path: string;
    component: () => Promise<{ default: ComponentType<any> }>;
    auth?: boolean;
  }>;
}
