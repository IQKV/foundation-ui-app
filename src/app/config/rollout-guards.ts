import { redirect } from "@tanstack/react-router";
import { isSingleTenantMode } from "./runtime-env";

/** Redirect to home when organization routes are accessed in SINGLE_TENANT mode. */
export function guardMultiTenantRoute(): void {
  if (isSingleTenantMode) {
    throw redirect({ to: "/" });
  }
}
