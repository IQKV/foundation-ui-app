/**
 * Shared surface accents for venue detail screens.
 * Deliberately quieter than the catalog list accents: lighter tones, no motion.
 */

/** Blue→cyan accent shared by the detail section cards. */
export const ACCENT_GRADIENT =
  "linear-gradient(135deg, var(--mantine-color-blue-3) 0%, var(--mantine-color-cyan-3) 100%)";

/** Neutral tone for the leading-edge marker on a record that is not enriched yet. */
export const UNLINKED_MARKER =
  "light-dark(var(--mantine-color-gray-3), var(--mantine-color-dark-4))";

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

/** Leading-edge marker geometry, shared by the enriched and neutral card states. */
const EDGE_MARKER = {
  content: '""',
  position: "absolute",
  top: 0,
  bottom: 0,
  left: 0,
  width: 4,
  pointerEvents: "none",
} as const;

/**
 * Section cards that carry the enrichment state on their leading edge instead of the
 * usual top hairline: the accent gradient once the record is linked/enriched, a
 * neutral grey while it is not.
 */
export const LINKED_CARD_STYLES = {
  root: {
    ...SECTION_CARD_STYLES.root,
    "&::before": { ...EDGE_MARKER, background: ACCENT_GRADIENT },
  },
} as const;

export const UNLINKED_CARD_STYLES = {
  root: {
    ...SECTION_CARD_STYLES.root,
    "&::before": { ...EDGE_MARKER, background: UNLINKED_MARKER },
  },
} as const;
