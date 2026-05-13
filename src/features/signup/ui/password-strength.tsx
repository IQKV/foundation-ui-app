import { Box, Progress, Text } from "@mantine/core";
import { Trans } from "@lingui/react/macro";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PasswordStrengthProps {
  password: string;
}

interface Requirement {
  label: React.ReactNode;
  met: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getRequirements(password: string): Requirement[] {
  return [
    { label: <Trans>At least 8 characters</Trans>, met: password.length >= 8 },
    { label: <Trans>Uppercase letter</Trans>, met: /[A-Z]/.test(password) },
    { label: <Trans>Lowercase letter</Trans>, met: /[a-z]/.test(password) },
    { label: <Trans>Number</Trans>, met: /\d/.test(password) },
    { label: <Trans>Special character</Trans>, met: /[^a-zA-Z0-9]/.test(password) },
  ];
}

function getStrength(requirements: Requirement[]): number {
  const met = requirements.filter((r) => r.met).length;
  return Math.round((met / requirements.length) * 100);
}

function getColor(strength: number): string {
  if (strength < 40) return "red";
  if (strength < 70) return "yellow";
  if (strength < 100) return "blue";
  return "green";
}

function getLabel(strength: number): React.ReactNode {
  if (strength < 40) return <Trans>Weak</Trans>;
  if (strength < 70) return <Trans>Fair</Trans>;
  if (strength < 100) return <Trans>Good</Trans>;
  return <Trans>Strong</Trans>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Password strength meter — shows a progress bar and per-requirement checklist.
 * Only renders when the password field has content.
 */
export function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const requirements = getRequirements(password);
  const strength = getStrength(requirements);
  const color = getColor(strength);

  return (
    <Box mt={4}>
      {/* Strength bar */}
      <Box style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Progress
          value={strength}
          color={color}
          size="xs"
          style={{ flex: 1 }}
          aria-label="Password strength"
        />
        <Text size="xs" c={color} fw={500} style={{ minWidth: 36, textAlign: "right" }}>
          {getLabel(strength)}
        </Text>
      </Box>

      {/* Requirements checklist */}
      <Box style={{ display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
        {requirements.map((req, i) => (
          <Text
            key={i}
            size="xs"
            c={req.met ? "green.6" : "dimmed"}
            style={{ display: "flex", alignItems: "center", gap: 4 }}
          >
            <span aria-hidden="true">{req.met ? "✓" : "○"}</span>
            {req.label}
          </Text>
        ))}
      </Box>
    </Box>
  );
}
