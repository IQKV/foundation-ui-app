import { useEffect } from "react";
import { useAskAiPanelStore, type AiContextAction } from "./ask-ai-panel.store";

interface AiContextOptions {
  /**
   * Override the backend endpoint used by sendMessage for this page.
   * Falls back to the default `/v1/aichat/chat` when not set.
   * @example "/v1/aichat/billing"
   */
  endpoint?: string;
}

/**
 * Register page-level context action chips and an optional endpoint override
 * for the Ask AI drawer.
 *
 * Call this hook from any page component with a stable array (useMemo or
 * module-level const) of actions. They appear as suggestion cards in the
 * drawer while the page is mounted and are cleared on unmount.
 *
 * @example
 * useAiContextActions(
 *   [{ label: "Summarise members", subtitle: "Team page", message: "Summarise the current team members." }],
 *   { endpoint: "/v1/aichat/team" },
 * );
 */
export function useAiContextActions(actions: AiContextAction[], options?: AiContextOptions): void {
  const setContextActions = useAskAiPanelStore((s) => s.setContextActions);
  const clearContextActions = useAskAiPanelStore((s) => s.clearContextActions);
  const setEndpoint = useAskAiPanelStore((s) => s.setEndpoint);
  const clearEndpoint = useAskAiPanelStore((s) => s.clearEndpoint);

  useEffect(() => {
    if (actions.length > 0) {
      setContextActions(actions);
    }
    if (options?.endpoint) {
      setEndpoint(options.endpoint);
    }
    return () => {
      clearContextActions();
      clearEndpoint();
    };
    // actions identity is intentionally not in deps — callers must pass a stable ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContextActions, clearContextActions, setEndpoint, clearEndpoint]);
}
