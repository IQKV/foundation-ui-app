import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import type { MantineStyleProp } from "@mantine/core";
import { tweenTransition, fadeIn } from "./variants";

export interface MotionBoxProps extends HTMLMotionProps<"div"> {
  /** Mantine-style prop forwarded to the wrapper div (optional convenience). */
  style?: MantineStyleProp & React.CSSProperties;
}

/**
 * `MotionBox` is a thin `motion.div` wrapper that defaults to a fade-in
 * animation and the shared tween transition.  Override any prop as needed.
 *
 * @example
 * // Fade in on mount
 * <MotionBox>
 *   <MyCard />
 * </MotionBox>
 *
 * @example
 * // Use a different variant
 * import { slideInRight } from "@/shared/lib/motion";
 * <MotionBox variants={slideInRight} initial="initial" animate="animate" exit="exit">
 *   <Content />
 * </MotionBox>
 */
export const MotionBox = forwardRef<HTMLDivElement, MotionBoxProps>(function MotionBox(
  {
    variants = fadeIn,
    initial = "initial",
    animate = "animate",
    exit = "exit",
    transition,
    ...rest
  },
  ref,
) {
  return (
    <motion.div
      ref={ref}
      variants={variants}
      initial={initial}
      animate={animate}
      exit={exit}
      transition={transition ?? tweenTransition}
      {...rest}
    />
  );
});
