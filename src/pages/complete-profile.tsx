import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Box, Text, Title } from "@mantine/core";
import { Trans, useLingui } from "@lingui/react/macro";

import { useEffect } from "react";
import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { CompleteProfileForm } from "@/features/complete-profile";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken, useSession } from "@/processes/session";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/complete-profile")({
  beforeLoad: () => {
    const token = getAccessToken();
    if (!token) {
      throw redirect({ to: "/sign-in" });
    }
    const payload = decodeJwt(token);
    // Not a valid tenant session yet — send to sign-in
    if (!payload || !isTenantSession(payload)) {
      throw redirect({ to: "/sign-in" });
    }
    // Already completed — no reason to be here
    if (payload.profile_completed) {
      throw redirect({ to: "/" });
    }
  },

  component: CompleteProfilePage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function CompleteProfilePage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const { payload } = useSession();

  // The hook sets a fresh token with profile_completed: true after the
  // three-step sequence finishes. Once the session store reflects the new
  // payload, navigate into the app.
  useEffect(() => {
    if (payload?.profile_completed) {
      void navigate({ to: "/" });
    }
  }, [payload?.profile_completed, navigate]);

  return (
    <AuthLayout
      headline={
        <>
          <Trans>One last</Trans>
          <br />
          <Text
            component="span"
            inherit
            style={{
              background: "linear-gradient(90deg, #60a5fa, #818cf8)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            <Trans>quick step.</Trans>
          </Text>
        </>
      }
      tagline={<Trans>Tell us your name so your teammates know who you are.</Trans>}
    >
      <PageTitle segments={[t`Complete your profile`]} />

      {/* Heading */}
      <Box>
        <Title order={2} fw={700} size="h3" mb={6}>
          <Trans>Complete your profile</Trans>
        </Title>
        <Text c="dimmed" size="sm">
          <Trans>Just a name to get started — everything else can wait.</Trans>
        </Text>
      </Box>

      {/* Form */}
      <CompleteProfileForm />
    </AuthLayout>
  );
}
