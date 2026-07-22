import { z } from "zod";

export const AddonConfigSchema = z.object({
  enabled: z.array(z.string()).default([]),
});

export type AddonConfig = z.infer<typeof AddonConfigSchema>;

export function getAddonConfig(): AddonConfig {
  // Read from window.* first (runtime config.js injection), fall back to the
  // build-time value so local dev with .env still works.
  const raw: string =
    (typeof window !== "undefined" && (window as any)["VITE_ENABLED_PLATFORM_ADDONS"]) ||
    import.meta.env.VITE_ENABLED_PLATFORM_ADDONS ||
    "";
  const enabledAddons = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { enabled: enabledAddons };
}
