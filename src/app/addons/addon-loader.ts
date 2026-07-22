import { addonRegistry } from "./addon-registry";
import type { Addon } from "./types";
import { getAddonConfig } from "@/app/config";

// Addon registry - can contain local imports or external package names
type AddonLoader = () => Promise<{ default: Addon }>;
type AvailableAddons = Record<string, AddonLoader | string>;

// Static addon imports map - add your addons here
const availableAddons: AvailableAddons = {
  // Example local addon:
  // "project-management": () => import("@/addons/project-management"),
  // Example external package:
  // "@company/my-external-addon": "@company/my-external-addon",
};

// Helper to load an addon from either local import or external package
async function loadAddon(addonId: string, loaderOrPackage: AddonLoader | string): Promise<Addon> {
  if (typeof loaderOrPackage === "string") {
    // It's an external package - import it directly
    const module = await import(loaderOrPackage);
    if (!module.default) {
      throw new Error(`External addon package ${loaderOrPackage} does not export a default addon`);
    }
    return module.default;
  }
  // It's a local import loader function
  const { default: addon } = await loaderOrPackage();
  return addon;
}

export async function loadAddons(): Promise<void> {
  const config = getAddonConfig();

  for (const addonId of config.enabled) {
    const loaderOrPackage = availableAddons[addonId];
    if (loaderOrPackage) {
      try {
        const addon = await loadAddon(addonId, loaderOrPackage);
        addonRegistry.register(addon);
      } catch (error) {
        console.error(`Failed to load addon ${addonId}:`, error);
      }
    } else {
      console.warn(`Addon ${addonId} not found in available addons`);
    }
  }
}
