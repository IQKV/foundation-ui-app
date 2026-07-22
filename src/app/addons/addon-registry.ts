import type { Addon, AddonContext } from "./types";

export class AddonRegistry {
  private addons = new Map<string, Addon>();

  register(addon: Addon): void {
    if (this.addons.has(addon.manifest.id)) {
      throw new Error(`Addon ${addon.manifest.id} already registered`);
    }
    this.addons.set(addon.manifest.id, addon);
  }

  getAddon(id: string): Addon | undefined {
    return this.addons.get(id);
  }

  getAllAddons(): Addon[] {
    return Array.from(this.addons.values());
  }

  async initializeAll(context: AddonContext): Promise<void> {
    for (const addon of this.getAllAddons()) {
      if (addon.initialize) {
        await addon.initialize(context);
      }
    }
  }
}

export const addonRegistry = new AddonRegistry();
