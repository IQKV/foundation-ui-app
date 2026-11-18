import { useEffect } from "react";
import { useAskAiPanelStore, type AiContextAction } from "./ask-ai-panel.store";
import type { ChatEndpoints } from "@/addons/platform-ai-chat/api/ai-chat-api";

interface AiContextOptions {
  /**
   * Redirect the AI calls for this page/route to a different service. Any field left
   * out falls back to the app-wide default, then to `/v1/aichat/chat`.
   * @example
   * {
   *   send: `/v1/catalog/venues/${venueId}/ask`,
   *   sessions: "/v1/catalog/chat/sessions",
   *   messages: "/v1/catalog/chat/sessions/:sessionId/messages",
   *   delete: "/v1/catalog/chat/sessions/:sessionId",
   * }
   */
  endpoints?: ChatEndpoints;
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
 *   { endpoints: { send: "/v1/catalog/venues/ask" } },
 * );
 */
export function useAiContextActions(actions: AiContextAction[], options?: AiContextOptions): void {
  const setContextActions = useAskAiPanelStore((s) => s.setContextActions);
  const clearContextActions = useAskAiPanelStore((s) => s.clearContextActions);
  const setEndpoints = useAskAiPanelStore((s) => s.setEndpoints);
  const clearEndpoints = useAskAiPanelStore((s) => s.clearEndpoints);

  useEffect(() => {
    if (actions.length > 0) {
      setContextActions(actions);
    }
    if (options?.endpoints) {
      setEndpoints(options.endpoints);
    }
    return () => {
      clearContextActions();
      clearEndpoints();
    };
    // actions identity is intentionally not in deps — callers must pass a stable ref
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setContextActions, clearContextActions, setEndpoints, clearEndpoints]);
}
