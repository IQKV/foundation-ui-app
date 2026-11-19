import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { venueChatApi } from "@/shared/api";
import type {
  VenueChatMessage,
  VenueChatMessageListResponse,
  VenueChatSendRequest,
  VenueChatResponse,
} from "@/shared/api";

// ─── Query keys ───────────────────────────────────────────────────────────────

const catalogChatKeys = {
  sessions: () => ["catalog", "chat", "sessions"] as const,
  messages: (sessionId: string) => ["catalog", "chat", "messages", sessionId] as const,
};

/** Newest turns kept in view — the model only remembers the newest few anyway. */
const MESSAGE_WINDOW = 50;

let draftSeq = 0;

function appendMessage(
  current: VenueChatMessageListResponse | undefined,
  message: VenueChatMessage,
): VenueChatMessageListResponse {
  return {
    items: [...(current?.items ?? []), message],
    totalElements: (current?.totalElements ?? 0) + 1,
  };
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCatalogChatMessages(sessionId: string | null) {
  return useQuery({
    queryKey: catalogChatKeys.messages(sessionId ?? ""),
    queryFn: async () => {
      // The endpoint pages oldest-first, so a long conversation would open on turns the
      // model no longer remembers. Take the newest window (the tail) instead.
      const head = await venueChatApi.getMessages(sessionId!, {
        limit: MESSAGE_WINDOW,
        offset: 0,
      });
      if (head.totalElements <= MESSAGE_WINDOW) return head;
      return venueChatApi.getMessages(sessionId!, {
        limit: MESSAGE_WINDOW,
        offset: head.totalElements - MESSAGE_WINDOW,
      });
    },
    enabled: !!sessionId,
  });
}

export function useSendCatalogMessage(opts?: { onSuccess?: (r: VenueChatResponse) => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: VenueChatSendRequest) => venueChatApi.send(body),
    // Show the user's turn at once — the reply is an LLM round-trip away.
    onMutate: (body) => {
      if (!body.sessionId) return undefined;
      const key = catalogChatKeys.messages(body.sessionId);
      const previous = queryClient.getQueryData<VenueChatMessageListResponse>(key);
      queryClient.setQueryData<VenueChatMessageListResponse>(key, (current) =>
        appendMessage(current, {
          id: `draft:${++draftSeq}`,
          sessionId: body.sessionId!,
          role: "USER",
          content: body.content,
          createdAt: new Date().toISOString(),
          sources: [],
        }),
      );
      return { key, previous };
    },
    onError: (_error, _body, context) => {
      if (context) queryClient.setQueryData(context.key, context.previous);
    },
    // Append the reply from the response instead of refetching the whole transcript.
    onSuccess: (result) => {
      queryClient.setQueryData<VenueChatMessageListResponse>(
        catalogChatKeys.messages(result.sessionId),
        (current) =>
          appendMessage(current, {
            id: `draft:${++draftSeq}`,
            sessionId: result.sessionId,
            role: "ASSISTANT",
            content: result.reply,
            createdAt: result.timestamp,
            sources: result.sources,
          }),
      );
      void queryClient.invalidateQueries({ queryKey: catalogChatKeys.sessions() });
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
