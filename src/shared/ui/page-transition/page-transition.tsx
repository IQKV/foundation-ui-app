import { AnimatePresence, motion } from "framer-motion";
import { useRouterState } from "@tanstack/react-router";
import { slideInRight, tweenTransition } from "@/shared/lib/motion";
import type { Variants } from "framer-motion";

export interface PageTransitionProps {
  children: React.ReactNode;
  /**
   * Override the animation variant.
   * Defaults to `slideInRight` — a subtle rightward slide + fade.
   */
  variants?: Variants;
  /**
   * Framer Motion transition config.
   * Defaults to the shared `tweenTransition` (0.22 s, Material ease).
   */
  transition?: React.ComponentProps<typeof motion.div>["transition"];
}

/**
 * `PageTransition` wraps a page's content in an `AnimatePresence` keyed to
 * the current TanStack Router pathname.  Every navigation causes the outgoing
 * page to play its `exit` animation while the incoming page plays `initial →
 * animate`.
 *
 * **Usage** — drop it inside the layout shell around `<Outlet />`:
 *
 * ```tsx
 * // In AppLayout or AppLayoutTopNav
 * <Box component="main" p="md" style={{ flex: 1 }}>
 *   <PageTransition>
 *     {children}
 *   </PageTransition>
 * </Box>
 * ```
 *
 * You can also use it inside an individual page to animate its sections:
 *
 * ```tsx
 * <PageTransition variants={fadeIn}>
 *   <Stack>…</Stack>
 * </PageTransition>
 * ```
 */
export function PageTransition({
  children,
  variants = slideInRight,
  transition = tweenTransition,
}: PageTransitionProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    // mode="wait" — exit finishes before the next page enters (clean, no overlap)
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={transition}
        // Ensure the wrapper never collapses and doesn't create an unwanted
        // scroll container — let the parent Box control layout.
        style={{ width: "100%", willChange: "opacity, transform" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
