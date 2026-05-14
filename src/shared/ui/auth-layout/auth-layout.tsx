import type { ReactNode } from "react";
import { Box, Flex, Group, Stack, Text, Title } from "@mantine/core";
import { IconShieldHalf } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { APP_NAME } from "@/shared/lib/page-title";
import { ColorSchemeToggle } from "@/shared/ui/color-scheme-toggle/color-scheme-toggle";
import { LocaleSwitcher } from "@/shared/ui/locale-switcher/locale-switcher";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AuthLayoutProps {
  /** Form panel content — rendered on the left (full width on mobile). */
  children: ReactNode;
  /**
   * Main headline rendered in the brand panel.
   * Pass a ReactNode so callers can include line breaks and gradient spans.
   * Defaults to the sign-in copy.
   */
  headline?: ReactNode;
  /**
   * Supporting tagline rendered below the headline.
   * Defaults to the sign-in copy.
   */
  tagline?: ReactNode;
}

// ─── Brand panel (right, desktop only) ───────────────────────────────────────

interface BrandPanelProps {
  headline: ReactNode;
  tagline: ReactNode;
}

function BrandPanel({ headline, tagline }: BrandPanelProps) {
  return (
    <Box
      visibleFrom="md"
      style={{
        flex: "0 0 50%",
        minHeight: "100vh",
        background: "linear-gradient(145deg, #1a1f2e 0%, #0f172a 55%, #1e3a5f 100%)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "48px 56px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Decorative background circles */}
      <Box style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        <Box
          style={{
            position: "absolute",
            width: 480,
            height: 480,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.08)",
            top: -120,
            right: -120,
          }}
        />
        <Box
          style={{
            position: "absolute",
            width: 320,
            height: 320,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.07)",
            bottom: 80,
            left: -80,
          }}
        />
        <Box
          style={{
            position: "absolute",
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(59,130,246,0.05)",
            bottom: 240,
            right: 80,
          }}
        />
      </Box>

      {/* Logo mark */}
      <Box style={{ position: "relative", zIndex: 1 }}>
        <Flex align="center" gap={10}>
          <Box
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(59,130,246,0.25)",
              border: "1px solid rgba(59,130,246,0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconShieldHalf size={20} color="#93c5fd" />
          </Box>
          <Text fw={700} size="lg" c="white" style={{ letterSpacing: "-0.02em" }}>
            {APP_NAME}
          </Text>
        </Flex>
      </Box>

      {/* Central headline + tagline */}
      <Box style={{ position: "relative", zIndex: 1 }}>
        <Title
          order={1}
          c="white"
          style={{
            fontSize: "clamp(2rem, 3.5vw, 2.75rem)",
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 20,
          }}
        >
          {headline}
        </Title>
        <Text c="rgba(255,255,255,0.55)" size="md" maw={420} style={{ lineHeight: 1.65 }}>
          {tagline}
        </Text>
      </Box>

      {/* Trust badges */}
      <Box
        style={{
          position: "relative",
          zIndex: 1,
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: 28,
        }}
      >
        <Text
          c="rgba(255,255,255,0.35)"
          size="xs"
          style={{ letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}
        >
          <Trans>Trusted by teams worldwide</Trans>
        </Text>
        <Flex gap="xl" wrap="wrap">
          {["SOC 2 Type II", "GDPR Ready"].map((badge) => (
            <Text key={badge} c="rgba(255,255,255,0.5)" size="sm" fw={500}>
              ✦ {badge}
            </Text>
          ))}
        </Flex>
      </Box>
    </Box>
  );
}

// ─── Form panel (left) ────────────────────────────────────────────────────────

function FormPanel({ children }: { children: ReactNode }) {
  return (
    <Flex
      style={{
        flex: 1,
        minHeight: "100vh",
        background: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 32px",
        position: "relative",
      }}
    >
      {/* Top-right utility bar — language + color scheme */}
      <Group gap={4} style={{ position: "absolute", top: 16, right: 16, zIndex: 1 }}>
        <LocaleSwitcher />
        <ColorSchemeToggle />
      </Group>

      <Box w="100%" maw={380}>
        {/* Mobile-only logo */}
        <Flex align="center" gap={10} hiddenFrom="md" mb="xl">
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "var(--mantine-color-blue-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconShieldHalf size={18} color="var(--mantine-color-blue-6)" />
          </Box>
          <Text fw={700} size="md" c="dark.8">
            {APP_NAME}
          </Text>
        </Flex>

        <Stack gap="xl">{children}</Stack>
      </Box>
    </Flex>
  );
}

// ─── Default brand copy ───────────────────────────────────────────────────────

function DefaultHeadline() {
  return (
    <>
      <Trans>Your workspace,</Trans>
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
        <Trans>always in reach.</Trans>
      </Text>
    </>
  );
}

function DefaultTagline() {
  return (
    <Trans>
      Manage your team, subscriptions, and settings — all from one place, secured by
      enterprise-grade authentication.
    </Trans>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

/**
 * Two-column auth layout: form on the left, branded panel on the right.
 * The brand panel is hidden on mobile — the form takes full width.
 *
 * Usage:
 * ```tsx
 * <AuthLayout>
 *   <MyFormContent />
 * </AuthLayout>
 *
 * // With custom brand copy:
 * <AuthLayout
 *   headline={<Trans>Reset your<br/>password.</Trans>}
 *   tagline={<Trans>We'll send you a secure link.</Trans>}
 * >
 *   <ForgotPasswordForm />
 * </AuthLayout>
 * ```
 */
export function AuthLayout({ children, headline, tagline }: AuthLayoutProps) {
  return (
    <Box style={{ minHeight: "100vh", display: "flex" }}>
      <FormPanel>{children}</FormPanel>
      <BrandPanel
        headline={headline ?? <DefaultHeadline />}
        tagline={tagline ?? <DefaultTagline />}
      />
    </Box>
  );
}
