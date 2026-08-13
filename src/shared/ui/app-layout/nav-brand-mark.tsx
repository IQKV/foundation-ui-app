/**
 * nav-brand-mark.tsx
 *
 * Pure presentational brand mark extracted from AppNavLogo so both
 * sidebar and top-nav variants can reuse it.
 *
 * Renders: logo icon + app name + tagline. Always white text, no background.
 * Caller provides the container background and layout.
 */

import { Group, Text, Box } from "@mantine/core";
import { IconShieldHalf } from "@tabler/icons-react";
import { appBrandName, appBrandTagline } from "@/app/config/runtime-env";
import type { CSSProperties } from "react";

export interface NavBrandMarkProps {
  style?: CSSProperties;
}

/**
 * Renders logo icon box + name + tagline.
 * Uses white text (caller owns the dark background).
 */
export function NavBrandMark({ style }: NavBrandMarkProps) {
  return (
    <Group gap={10} style={{ cursor: "default", ...style }} wrap="nowrap">
      <Box
        style={{
          width: 30,
          height: 30,
          borderRadius: "var(--mantine-radius-sm)",
          background: "var(--mantine-color-blue-6)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          boxShadow: "0 2px 6px rgba(59,78,240,0.45)",
        }}
        data-testid="nav-logo-mark"
      >
        <IconShieldHalf size={16} color="white" strokeWidth={1.8} />
      </Box>

      <Box style={{ lineHeight: 1 }}>
        <Text
          size="sm"
          fw={700}
          style={{ color: "#ffffff", letterSpacing: "-0.02em", lineHeight: 1.2 }}
        >
          {appBrandName}
        </Text>
        <Text
          size="xs"
          style={{
            color: "rgba(255,255,255,0.40)",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "0.60rem",
            lineHeight: 1.4,
          }}
        >
          {appBrandTagline}
        </Text>
      </Box>
    </Group>
  );
}
