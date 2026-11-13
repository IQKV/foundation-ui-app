/**
 * Shared surface accents for venue detail screens.
 * Colour strength matches the semantic-search toolbar bar so the accent reads the same
 * everywhere; it must stay clearly stronger than the neutral marker to signal the state.
 */

/** Blue→cyan accent shared by the detail section cards. */
export const ACCENT_GRADIENT =
  "linear-gradient(135deg, var(--mantine-color-blue-filled) 0%, var(--mantine-color-cyan-filled) 100%)";

/**
 * Neutral tone for the leading-edge marker on a record that is not enriched yet.
 * Must differ from `--mantine-color-default-border`, or it disappears into the card border.
 */
export const UNLINKED_MARKER =
  "light-dark(var(--mantine-color-gray-4), var(--mantine-color-dark-3))";

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
      height: 3,
      background: ACCENT_GRADIENT,
      opacity: 0.85,
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
      width: 4,
      background: ACCENT_GRADIENT,
      opacity: 0.8,
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
  width: 5,
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
