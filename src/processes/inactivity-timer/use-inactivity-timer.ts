import { useEffect, useRef } from "react";

export interface UseInactivityTimerOptions {
  /** Milliseconds of inactivity before `onTimeout` is called. Defaults to 30 minutes. */
  timeoutMs?: number;
  /** Called when the inactivity timer fires. */
  onTimeout: () => void;
}

const DEFAULT_TIMEOUT_MS = 30 * 60 * 1000;

const TRACKED_EVENTS = ["mousemove", "keydown", "mousedown", "touchstart", "scroll"] as const;

/**
 * Starts an inactivity timer that calls `options.onTimeout` after `timeoutMs`
 * milliseconds of no user interaction.
 *
 * Tracked events: mousemove, keydown, mousedown, touchstart, scroll.
 * The timer resets on every tracked event.
 * All listeners and the timeout are cleaned up on unmount.
 */
export function useInactivityTimer(options: UseInactivityTimerOptions): void {
  const { timeoutMs = DEFAULT_TIMEOUT_MS, onTimeout } = options;

  // Keep a stable ref to onTimeout so the effect doesn't re-run when the
  // callback identity changes between renders.
  const onTimeoutRef = useRef(onTimeout);
  onTimeoutRef.current = onTimeout;

  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
      }
      timeoutIdRef.current = setTimeout(() => {
        onTimeoutRef.current();
      }, timeoutMs);
    };

    // Start the timer immediately when the effect runs.
    resetTimer();

    // Attach all tracked event listeners.
    for (const event of TRACKED_EVENTS) {
      window.addEventListener(event, resetTimer);
    }

    return () => {
      // Remove all event listeners.
      for (const event of TRACKED_EVENTS) {
        window.removeEventListener(event, resetTimer);
      }

      // Clear the pending timeout so onTimeout is never called after unmount.
      if (timeoutIdRef.current !== null) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [timeoutMs]);
}
