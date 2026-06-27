import { createFileRoute, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useLingui } from "@lingui/react/macro";

import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { MagicLinkExchangeForm } from "@/features/magic-link";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";
import { isMagicLinkEnabled } from "@/app/config/runtime-env";

const magicLinkVerifySearchSchema = z.object({
  token: z.string(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/magic-link/verify")({
  validateSearch: magicLinkVerifySearchSchema,

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

  component: MagicLinkVerifyPage,
});

function MagicLinkVerifyPage() {
  const { t } = useLingui();
  const { token, redirect: redirectTo } = Route.useSearch();

  return (
    <AuthLayout>
      <PageTitle segments={[t`Signing in`]} />

      <MagicLinkExchangeForm token={token} redirectTo={redirectTo} />
    </AuthLayout>
  );
}
