import { appTitle } from "@/app/config/runtime-env";

/**
 * Application name used as the title suffix across all pages.
 * Driven by the VITE_APP_TITLE runtime env variable (falls back to "Key Value").
 */
export const APP_TITLE = appTitle;
