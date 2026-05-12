/**
 * Application name used as the title suffix across all pages.
 * Centralised here so it only needs to change in one place.
 */
export const APP_NAME = "Key Value Admin";

/**
 * Builds a browser tab title in the format "Page Name | Key Value Admin".
 *
 * Usage inside a component (the page name is already translated via `t`):
 *
 * ```tsx
 * const { t } = useLingui();
 * <title>{pageTitle(t`Dashboard`)}</title>
 * ```
 *
 * For dynamic / loading states pass the resolved string or a fallback:
 *
 * ```tsx
 * <title>{pageTitle(isLoading ? t`User` : displayName)}</title>
 * ```
 */
export function pageTitle(name: string): string {
  return `${name} | ${APP_NAME}`;
}
