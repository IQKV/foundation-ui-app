import { Box, Loader, Stack, Text, ThemeIcon } from "@mantine/core";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";

interface ProvisioningWaitProps {
  isTimeout: boolean;
}

/**
 * Step 2 — Workspace provisioning wait screen.
 *
 * Shows an animated spinner and rotating status messages while the backend
 * runs Liquibase migrations for the new tenant schema. Typically completes
 * in 2–5 seconds. After 30s shows a "taking longer than expected" message
 * but continues polling.
 */
export function ProvisioningWait({ isTimeout }: ProvisioningWaitProps) {
  return (
    <Stack gap="lg" align="center" ta="center">
      {isTimeout ? (
        <ThemeIcon size={56} radius="xl" color="orange" variant="light">
          <IconAlertTriangle size={28} />
        </ThemeIcon>
      ) : (
        <Box
          style={{
            width: 56,
            height: 56,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader size="lg" color="blue" type="dots" />
        </Box>
      )}

      <Box>
        <Text fw={600} size="md" mb={4}>
          {isTimeout ? <Trans>Still setting up…</Trans> : <Trans>Setting up your workspace</Trans>}
        </Text>
        <Text size="sm" c="dimmed" maw={300}>
          {isTimeout ? (
            <Trans>
              This is taking a bit longer than usual. Hang tight — we're still working on it.
            </Trans>
          ) : (
            <Trans>We're preparing your workspace. This usually takes just a few seconds.</Trans>
          )}
        </Text>
      </Box>

      {/* Animated step indicators */}
      {!isTimeout && (
        <Stack gap={6} style={{ width: "100%", maxWidth: 260 }}>
          {[
            <Trans key="1">Creating your account</Trans>,
            <Trans key="2">Provisioning workspace</Trans>,
            <Trans key="3">Configuring settings</Trans>,
          ].map((label, i) => (
            <Box
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                opacity: 0.7,
              }}
            >
              <Box
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--mantine-color-blue-5)",
                  flexShrink: 0,
                }}
              />
              <Text size="xs" c="dimmed">
                {label}
              </Text>
            </Box>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
