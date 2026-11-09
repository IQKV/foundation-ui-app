/**
 * Shared surface accents for venue detail screens.
 * Deliberately quieter than the catalog list accents: lighter tones, no motion.
 */

/** Blue→cyan accent shared by the detail section cards. */
export const ACCENT_GRADIENT =
  "linear-gradient(135deg, var(--mantine-color-blue-3) 0%, var(--mantine-color-cyan-3) 100%)";

/** Hairline gradient strip along the top edge of a section card. */
export const SECTION_CARD_STYLES = {
  root: {
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      height: 2,
      background: ACCENT_GRADIENT,
      opacity: 0.7,
      pointerEvents: "none",
    },
  },
} as const;

/** Hairline gradient bar along the leading edge of a list row (e.g. photo asset rows). */
export const ASSET_ROW_STYLES = {
  root: {
    position: "relative",
    overflow: "hidden",
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      left: 0,
      width: 3,
      background: ACCENT_GRADIENT,
      opacity: 0.65,
      pointerEvents: "none",
    },
  },
} as const;
