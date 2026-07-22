import { z } from "zod";

export const AddonConfigSchema = z.object({
  enabled: z.array(z.string()).default([]),
});

export type AddonConfig = z.infer<typeof AddonConfigSchema>;

export function getAddonConfig(): AddonConfig {
  const enabledAddons = import.meta.env.VITE_ENABLED_PLATFORM_ADDONS?.split(",") ?? [];
  return { enabled: enabledAddons };
}
