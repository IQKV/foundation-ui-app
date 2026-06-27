import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertTriangle,
  IconBuilding,
  IconCheck,
  IconCircleCheck,
  IconMail,
  IconShieldHalf,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";

import { Link } from "@tanstack/react-router";
import { PageTitle } from "@/shared/lib/page-title";
import { AuthLayout } from "@/shared/ui";
import { useAcceptInvitation } from "@/features/accept-invitation";
import { decodeJwt, isTenantSession } from "@/shared/lib/jwt";
import { getAccessToken } from "@/processes/session";
import { dayjs } from "@/shared/lib/date-utils";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/invite/$token")({
  // Redirect already-authenticated users straight to the app.
  beforeLoad: () => {
    const token = getAccessToken();
    if (token) {
      const payload = decodeJwt(token);
      if (payload && isTenantSession(payload)) {
        throw redirect({ to: "/" });
      }
    }
  },
  component: InvitePage,
});

// ─── Page ─────────────────────────────────────────────────────────────────────

function InvitePage() {
  const { t } = useLingui();
  const { token } = Route.useParams();

  const { phase, preview, form, isSubmitting, errorMessage, onSubmit } = useAcceptInvitation(token);

  const handleFormSubmit = form.onSubmit(onSubmit);

  return (
    <AuthLayout
      headline={
        <>
          <Trans>You've been</Trans>
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
            <Trans>invited.</Trans>
          </Text>
        </>
      }
      tagline={
        preview ? (
          <Trans>Join {preview.tenantName} and start collaborating with your team.</Trans>
        ) : (
          <Trans>Accept your invitation to join a workspace.</Trans>
        )
      }
    >
      <PageTitle segments={[t`Accept Invitation`]} />

      {/* ── Loading preview ──────────────────────────────────────────────── */}
      {phase === "preview" && (
        <Stack gap="md" align="center" ta="center">
          <Loader size="lg" color="blue" type="dots" />
          <Text size="sm" c="dimmed">
            <Trans>Loading your invitation…</Trans>
          </Text>
        </Stack>
      )}

      {/* ── Invalid / expired ────────────────────────────────────────────── */}
      {phase === "invalid" && (
        <Stack gap="lg" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color="red" variant="light">
            <IconAlertTriangle size={32} />
          </ThemeIcon>
          <Box>
            <Title order={3} fw={700} mb={6}>
              <Trans>Invitation not found</Trans>
            </Title>
            <Text size="sm" c="dimmed">
              <Trans>
                This invitation link has expired, been revoked, or doesn't exist. Contact the person
                who invited you to request a new one.
              </Trans>
            </Text>
          </Box>
          <Button component={Link} to="/sign-in" variant="outline" fullWidth>
            <Trans>Back to sign in</Trans>
          </Button>
        </Stack>
      )}

      {/* ── Success ──────────────────────────────────────────────────────── */}
      {phase === "success" && (
        <Stack gap="lg" align="center" ta="center">
          <ThemeIcon size={64} radius="xl" color="green" variant="light">
            <IconCircleCheck size={32} />
          </ThemeIcon>
          <Box>
            <Title order={3} fw={700} mb={6}>
              <Trans>Welcome aboard</Trans>
            </Title>
            <Text size="sm" c="dimmed">
              <Trans>Signing you in…</Trans>
            </Text>
          </Box>
          <Loader size="sm" />
        </Stack>
      )}

      {/* ── Accept form ──────────────────────────────────────────────────── */}
      {phase === "accept" && preview && (
        <>
          <Box>
            <Title order={2} fw={700} size="h3" mb={6}>
              <Trans>Join {preview.tenantName}</Trans>
            </Title>
            <Text c="dimmed" size="sm">
              {preview.requiresSignup ? (
                <Trans>Create your account to accept this invitation.</Trans>
              ) : (
                <Trans>Enter your password to confirm your identity and join.</Trans>
              )}
            </Text>
          </Box>

          {/* Invitation summary card */}
          <Paper withBorder radius="md" p="md">
            <Stack gap="xs">
              <Group gap="sm">
                <ThemeIcon size="sm" variant="light" color="blue" radius="xl">
                  <IconBuilding size={13} />
                </ThemeIcon>
                <Text size="sm" fw={500}>
                  {preview.tenantName}
                </Text>
              </Group>
              <Group gap="sm">
                <ThemeIcon size="sm" variant="light" color="gray" radius="xl">
                  <IconMail size={13} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  {preview.email}
                </Text>
              </Group>
              <Group gap="sm">
                <ThemeIcon size="sm" variant="light" color="violet" radius="xl">
                  <IconShieldHalf size={13} />
                </ThemeIcon>
                <Text size="sm" c="dimmed">
                  {preview.authority}
                </Text>
              </Group>
              <Divider />
              <Text size="xs" c="dimmed">
                <Trans>Expires</Trans> {dayjs(preview.expiresAt).format("MMM D, YYYY [at] HH:mm")}
              </Text>
            </Stack>
          </Paper>

          {/* Accept form */}
          <form onSubmit={handleFormSubmit} noValidate>
            <Stack gap="md">
              {/* Server-side error */}
              <div aria-live="polite" aria-atomic="true">
                {errorMessage && (
                  <Alert
                    icon={<IconAlertTriangle size={16} />}
                    color="red"
                    variant="light"
                    role="alert"
                  >
                    {errorMessage}
                  </Alert>
                )}
              </div>

              {/* Name fields — only for new users */}
              {preview.requiresSignup && (
                <Group grow>
                  <TextInput
                    label={t`First name`}
                    placeholder={t`Jane`}
                    autoComplete="given-name"
                    disabled={isSubmitting}
                    {...form.getInputProps("firstName")}
                  />
                  <TextInput
                    label={t`Last name`}
                    placeholder={t`Smith`}
                    autoComplete="family-name"
                    disabled={isSubmitting}
                    {...form.getInputProps("lastName")}
                  />
                </Group>
              )}

              {/* Email — read-only, pre-filled from preview */}
              <TextInput
                label={t`Email`}
                value={preview.email}
                readOnly
                styles={{
                  input: {
                    cursor: "default",
                    color: "var(--mantine-color-gray-6)",
                    background: "var(--mantine-color-gray-0)",
                  },
                }}
                rightSection={
                  <Text size="xs" c="dimmed" pr={4}>
                    <Trans>read-only</Trans>
                  </Text>
                }
                rightSectionWidth={72}
              />

              <PasswordInput
                label={t`Password`}
                placeholder={
                  preview.requiresSignup ? t`Choose a password` : t`Your existing password`
                }
                autoComplete={preview.requiresSignup ? "new-password" : "current-password"}
                disabled={isSubmitting}
                {...form.getInputProps("password")}
              />

              <Button
                type="submit"
                fullWidth
                loading={isSubmitting}
                leftSection={<IconCheck size={16} />}
                mt={4}
              >
                {preview.requiresSignup ? (
                  <Trans>Create account and join</Trans>
                ) : (
                  <Trans>Accept invitation</Trans>
                )}
              </Button>

              <Text size="xs" c="dimmed" ta="center">
                <Trans>
                  Already have an account?{" "}
                  <Text component={Link} to="/sign-in" size="xs" c="blue.6">
                    Sign in
                  </Text>
                </Trans>
              </Text>
            </Stack>
          </form>
        </>
      )}
    </AuthLayout>
  );
}
