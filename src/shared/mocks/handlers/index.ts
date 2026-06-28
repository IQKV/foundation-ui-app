import { authHandlers } from "./auth.handlers";
import { userHandlers } from "./user.handlers";
import { tenantHandlers } from "./tenant.handlers";

/**
 * Combined MSW handler list.
 *
 * Order matters — first match wins. Auth handlers go first so that
 * authentication endpoints are not accidentally caught by broader patterns.
 */
export const handlers = [...authHandlers, ...userHandlers, ...tenantHandlers];
