import type { Variants } from "framer-motion";

/**
 * Slide in from the right — default page transition.
 * Use with `initial`, `animate`, `exit` on a motion element.
 */
export const slideInRight: Variants = {
  initial: { opacity: 0, x: 24 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -24 },
};

/**
 * Slide in from the bottom — good for modals and drawers rendered outside
 * the normal AnimatePresence page flow.
 */
export const slideInBottom: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 16 },
};

/**
 * Pure cross-fade — no translation, minimal distraction.
 * Useful for content areas that swap in place (tabs, panels).
 */
export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

/**
 * Scale up from 95 % — feels snappy for cards and overlays.
 */
export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

/**
 * Stagger container — apply to a list wrapper so children animate in sequence.
 * Children should use any of the variants above; the stagger is controlled here.
 *
 * @example
 * <motion.ul variants={staggerContainer} initial="initial" animate="animate">
 *   {items.map(i => <motion.li key={i} variants={fadeIn} />)}
 * </motion.ul>
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07 },
  },
  exit: {},
};

/** Shared spring transition — snappy but not bouncy. */
export const springTransition = {
  type: "spring",
  stiffness: 380,
  damping: 30,
} as const;

/** Shared tween transition — smooth, predictable. */
export const tweenTransition = {
  type: "tween",
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1], // Material Design standard easing
} as const;
