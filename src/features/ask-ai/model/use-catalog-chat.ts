import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venueChatApi } from "@/shared/api";
import type { VenueChatSendRequest, VenueChatResponse } from "@/shared/api";

// ─── Query keys ───────────────────────────────────────────────────────────────

const catalogChatKeys = {
  sessions: () => ["catalog", "chat", "sessions"] as const,
  messages: (sessionId: string) => ["catalog", "chat", "messages", sessionId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCatalogChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: catalogChatKeys.messages(sessionId ?? ""),
    queryFn: () => venueChatApi.getMessages(sessionId!, { limit: 50, offset: 0 }),
    enabled: !!sessionId,
  });
}

export function useSendCatalogMessage(opts?: { onSuccess?: (r: VenueChatResponse) => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: VenueChatSendRequest) => venueChatApi.send(body),
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: catalogChatKeys.sessions() });
      void queryClient.invalidateQueries({ queryKey: catalogChatKeys.messages(result.sessionId) });
      opts?.onSuccess?.(result);
    },
  });
}

export function useDeleteCatalogSession(opts?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => venueChatApi.deleteSession(sessionId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: catalogChatKeys.sessions() });
      opts?.onSuccess?.();
    },
  });
}
