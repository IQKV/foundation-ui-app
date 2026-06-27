import { useEffect } from "react";
import { APP_TITLE } from "./constants";

/**
 * Sets the document title using a breadcrumb pattern.
 *
 * @param segments - Title segments from most-specific (leaf) to least-specific (section).
 *                   The app name is appended automatically.
 * @param appTitle - Override the rightmost app-name segment (defaults to APP_TITLE).
 *
 * @example
 * // Renders: "Edit Profile | Account Settings | Key Value"
 * usePageTitle(["Edit Profile", "Account Settings"]);
 */
export function usePageTitle(segments: string[], appTitle = APP_TITLE): void {
  useEffect(() => {
    const title = [...segments, appTitle].join(" | ");
    document.title = title;
  }, [segments, appTitle]);
}
