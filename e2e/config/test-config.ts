/**
 * Backward-compatible re-export of all config modules.
 *
 * New code should import directly from the focused modules:
 *   import { ROUTES }    from "./routes.js"
 *   import { TIMEOUTS }  from "./timeouts.js"
 *   import { AUTH_CONFIG } from "./auth.js"
 *   import { VIEWPORTS } from "./viewports.js"
 *
 * Existing code that imports TEST_CONFIG from this file continues to work.
 */
export { ROUTES } from "./routes.js";
export { TIMEOUTS } from "./timeouts.js";
export { AUTH_CONFIG } from "./auth.js";
export { VIEWPORTS } from "./viewports.js";

import { ROUTES } from "./routes.js";
import { TIMEOUTS } from "./timeouts.js";
import { AUTH_CONFIG } from "./auth.js";
import { VIEWPORTS } from "./viewports.js";

/**
 * @deprecated Import directly from the focused config modules instead.
 * Kept for backward compatibility with existing test files.
 */
export const TEST_CONFIG = {
  DEFAULT_TIMEOUT: TIMEOUTS.DEFAULT,
  NAVIGATION_TIMEOUT: TIMEOUTS.NAVIGATION,
  VIEWPORTS,
  ROUTES,
  TENANT_OWNER: AUTH_CONFIG.TENANT_OWNER,
  STORAGE_STATE: AUTH_CONFIG.STORAGE_STATE,
} as const;
