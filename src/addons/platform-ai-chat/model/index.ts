import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { aiChatApi, resolveChatEndpoints } from "../api/ai-chat-api";
import type { ChatEndpoints, ChatResponse } from "../api/ai-chat-api";

// ─── Query keys ───────────────────────────────────────────────────────────────

// The endpoint is part of the key so two services never share a cache entry.
export const chatKeys = {
  all: ["addon", "ai-chat"] as const,
  sessions: (sessionsEndpoint: string) => [...chatKeys.all, "sessions", sessionsEndpoint] as const,
  messages: (messagesEndpoint: string, sessionId: string) =>
    [...chatKeys.all, "messages", messagesEndpoint, sessionId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSessions(endpoints?: ChatEndpoints) {
  const { sessions } = resolveChatEndpoints(endpoints);
  return useQuery({
    queryKey: chatKeys.sessions(sessions),
    queryFn: () => aiChatApi.getSessions({ limit: 50, offset: 0 }, endpoints),
  });
}

export function useMessages(sessionId: string, endpoints?: ChatEndpoints) {
  const { messages } = resolveChatEndpoints(endpoints);
  return useQuery({
    queryKey: chatKeys.messages(messages, sessionId),
    queryFn: () => aiChatApi.getMessages(sessionId, { limit: 50, offset: 0 }, endpoints),
    enabled: !!sessionId,
  });
}

export function useSendMessage(opts?: {
  onSuccess?: (r: ChatResponse) => void;
  endpoints?: ChatEndpoints;
}) {
  const queryClient = useQueryClient();
  const resolved = resolveChatEndpoints(opts?.endpoints);

  return useMutation({
    mutationFn: (body: Parameters<typeof aiChatApi.sendMessage>[0]) =>
      aiChatApi.sendMessage(body, opts?.endpoints),
    onSuccess: (result) => {
      // Invalidate sessions (title/updatedAt may have changed)
      void queryClient.invalidateQueries({ queryKey: chatKeys.sessions(resolved.sessions) });
      // Invalidate messages for this session so the new USER + ASSISTANT messages appear
      void queryClient.invalidateQueries({
        queryKey: chatKeys.messages(resolved.messages, result.sessionId),
      });
      opts?.onSuccess?.(result);
    },
  });
}

export function useDeleteSession(opts?: { onSuccess?: () => void; endpoints?: ChatEndpoints }) {
  const queryClient = useQueryClient();
  const resolved = resolveChatEndpoints(opts?.endpoints);

  return useMutation({
    mutationFn: (sessionId: string) => aiChatApi.deleteSession(sessionId, opts?.endpoints),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.sessions(resolved.sessions) });
      notifications.show({
        color: "red",
        title: "Session deleted",
        message: "Chat session removed.",
      });
      opts?.onSuccess?.();
    },
  });
}

export { useChatInputHistory } from "./use-chat-input-history";
