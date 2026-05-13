import { Box, Button, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconMailCheck } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";

interface VerifyEmailPromptProps {
  email: string;
  isLoading: boolean;
  resendCooldown: number;
  onEnterWorkspace: () => Promise<void>;
  onResendVerification: () => Promise<void>;
}

/**
 * Step 3 — Email verification prompt.
 *
 * The user's workspace is ready. We don't block them from entering — they can
 * proceed immediately. A persistent banner in the app will remind them to
 * verify their email until they do.
 *
 * The "Resend" button has a 60s cooldown to prevent abuse.
 */
export function VerifyEmailPrompt({
  email,
  isLoading,
  resendCooldown,
  onEnterWorkspace,
  onResendVerification,
}: VerifyEmailPromptProps) {
  return (
    <Stack gap="lg" align="center" ta="center">
      <ThemeIcon size={64} radius="xl" color="blue" variant="light">
        <IconMailCheck size={32} />
      </ThemeIcon>

      <Box>
        <Text fw={700} size="lg" mb={6}>
          <Trans>Check your inbox</Trans>
        </Text>
        <Text size="sm" c="dimmed" maw={320}>
          <Trans>
            We sent a verification link to <strong>{email}</strong>. Click it to confirm your email
            address.
          </Trans>
        </Text>
      </Box>

      {/* Primary CTA — enter the workspace now */}
      <Button
        fullWidth
        size="md"
        loading={isLoading}
        disabled={isLoading}
        onClick={() => void onEnterWorkspace()}
      >
        <Trans>Enter your workspace</Trans>
      </Button>

      {/* Secondary — resend with cooldown */}
      <Stack gap={4} align="center">
        <Text size="sm" c="dimmed">
          <Trans>Didn't receive it? Check your spam folder or</Trans>
        </Text>
        <Button
          variant="subtle"
          size="xs"
          disabled={resendCooldown > 0 || isLoading}
          onClick={() => void onResendVerification()}
        >
          {resendCooldown > 0 ? (
            <Trans>Resend in {resendCooldown}s</Trans>
          ) : (
            <Trans>Resend verification email</Trans>
          )}
        </Button>
      </Stack>
    </Stack>
  );
}
