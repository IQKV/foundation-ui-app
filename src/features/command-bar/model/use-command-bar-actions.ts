import { useEffect } from "react";
import { useCommandBarStore, type CommandBarAction } from "./command-bar.store";

interface CommandBarOptions {
  /** Fully hide the command bar while this page is mounted. */
  hidden?: boolean;
}

/**
 * Register page-level actions in the command bar and optionally hide it.
 *
 * Pass a stable array reference (module-level const or useMemo).
 * Actions and visibility are restored to defaults on unmount.
 *
 * @example
 * // Add buttons
 * useCommandBarActions([
 *   { id: "invite", label: "Invite Member", icon: IconUserPlus, onClick: openModal },
 * ]);
 *
 * @example
 * // Hide the bar entirely on this page
 * useCommandBarActions([], { hidden: true });
 */
export function useCommandBarActions(
  actions: CommandBarAction[],
  options?: CommandBarOptions,
): void {
  const setSpotlightActions = useCommandBarStore((s) => s.setSpotlightActions);
  const clearSpotlightActions = useCommandBarStore((s) => s.clearSpotlightActions);
  const hide = useCommandBarStore((s) => s.hide);
  const show = useCommandBarStore((s) => s.show);

  useEffect(() => {
    if (options?.hidden) {
      hide();
    }
    if (actions.length > 0) {
      setSpotlightActions(actions);
    }
    return () => {
      show();
      clearSpotlightActions();
    };
    // actions identity intentionally excluded — callers must pass a stable ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hide, show, setSpotlightActions, clearSpotlightActions, options?.hidden]);
}
