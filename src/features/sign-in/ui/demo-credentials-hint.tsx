import { ActionIcon, Box, Code, CopyButton, Group, Stack, Text, Tooltip } from "@mantine/core";
import { IconCheck, IconCopy, IconFlask } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEMO_EMAIL = "tenant.owner@demo.iqkv.com";
const DEMO_PASSWORD = "ChangeMePass123!";

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CopyRowProps {
  label: string;
  value: string;
  testId: string;
}

function CopyRow({ label, value, testId }: CopyRowProps) {
  return (
    <Group justify="space-between" gap="xs" wrap="nowrap">
      <Box style={{ minWidth: 0 }}>
        <Text size="xs" c="dimmed" mb={2}>
          {label}
        </Text>
        <Code
          style={{
            fontSize: "0.75rem",
            wordBreak: "break-all",
            background: "transparent",
            padding: 0,
          }}
          data-testid={testId}
        >
          {value}
        </Code>
      </Box>

      <CopyButton value={value} timeout={2000}>
        {({ copied, copy }) => (
          <Tooltip label={copied ? <Trans>Copied!</Trans> : <Trans>Copy</Trans>} withArrow>
            <ActionIcon
              variant="subtle"
              color={copied ? "teal" : "gray"}
              size="sm"
              onClick={copy}
              aria-label={copied ? String("Copied") : String("Copy " + label)}
              data-testid={`${testId}-copy-btn`}
              style={{ flexShrink: 0 }}
            >
              {copied ? <IconCheck size={13} /> : <IconCopy size={13} />}
            </ActionIcon>
          </Tooltip>
        )}
      </CopyButton>
    </Group>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Displays demo credentials on the sign-in page when `isDemoMode` is `true`.
 *
 * Rendered only in demo environments — never in production — because
 * the parent (`SignInForm`) guards the render with `isDemoMode`.
 */
export function DemoCredentialsHint() {
  return (
    <Box
      p="sm"
      style={(theme) => ({
        borderRadius: theme.radius.md,
        border: `1px solid ${theme.colors.violet[4]}`,
        background: `color-mix(in srgb, ${theme.colors.violet[6]} 8%, transparent)`,
      })}
      data-testid="demo-credentials-hint"
      role="note"
      aria-label="Demo credentials"
    >
      <Stack gap="xs">
        {/* Header */}
        <Group gap={6}>
          <IconFlask size={14} color="var(--mantine-color-violet-5)" aria-hidden="true" />
          <Text size="xs" fw={600} c="violet.4" style={{ letterSpacing: "0.04em" }}>
            <Trans>Demo environment</Trans>
          </Text>
        </Group>

        {/* Credential rows */}
        <CopyRow label="Email" value={DEMO_EMAIL} testId="demo-email" />
        <CopyRow label="Password" value={DEMO_PASSWORD} testId="demo-password" />
      </Stack>
    </Box>
  );
}
