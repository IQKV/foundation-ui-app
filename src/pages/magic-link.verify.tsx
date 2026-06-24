import { createFileRoute, redirect } from "@tanstack/react-router";
import { Alert, Box, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import { z } from "zod";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { Link } from "@tanstack/react-router";
import { pageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { MagicLinkExchangeForm } from "@/features/magic-link";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";

const magicLinkVerifySearchSchema = z.object({
  token: z.string(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/magic-link/verify")({
  validateSearch: magicLinkVerifySearchSchema,

  beforeLoad: () => {
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
      <Helmet>
        <title>{pageTitle(t`Signing in`)}</title>
      </Helmet>

      <MagicLinkExchangeForm token={token} redirectTo={redirectTo} />
    </AuthLayout>
  );
}
