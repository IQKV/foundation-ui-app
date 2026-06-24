import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";
import { isMagicLinkEnabled } from "@/app/config/runtime-env";

export const Route = createFileRoute("/magic-link")({
  beforeLoad: () => {
    if (!isMagicLinkEnabled) {
      throw redirect({ to: "/sign-in" });
    }
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && isTenantSession(payload)) {
        throw redirect({ to: "/" });
      }
    }
  },

  component: () => <Outlet />,
});
