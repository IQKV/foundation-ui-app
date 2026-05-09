const readRuntimeEnv = (key: string): string | undefined => {
  const w: any = typeof window !== "undefined" ? (window as any) : undefined;
  return (w && w[key]) ?? (import.meta as any).env?.[key];
};

const ENV_KEYS = ["VITE_API_SERVER_URL", "VITE_LOG_LEVEL"] as const;

export const clientBuildEnv: Record<string, string | undefined> = Object.fromEntries(
  ENV_KEYS.map((k) => [k, readRuntimeEnv(k)]),
) as Record<string, string | undefined>;

export const getConfig = (key: string, fallback?: string): string | undefined => {
  return clientBuildEnv[key] ?? fallback;
};
