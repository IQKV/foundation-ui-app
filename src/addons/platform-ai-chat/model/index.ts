import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notifications } from "@mantine/notifications";
import { aiChatApi } from "../api/ai-chat-api";
import type { ChatResponse } from "../api/ai-chat-api";

// ─── Query keys ───────────────────────────────────────────────────────────────

export const chatKeys = {
  all: ["addon", "ai-chat"] as const,
  sessions: () => [...chatKeys.all, "sessions"] as const,
  messages: (sessionId: string) => [...chatKeys.all, "messages", sessionId] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useSessions() {
  return useQuery({
    queryKey: chatKeys.sessions(),
    queryFn: () => aiChatApi.getSessions({ limit: 50, offset: 0 }),
  });
}

export function useMessages(sessionId: string) {
  return useQuery({
    queryKey: chatKeys.messages(sessionId),
    queryFn: () => aiChatApi.getMessages(sessionId, { limit: 50, offset: 0 }),
    enabled: !!sessionId,
  });
}

export function useSendMessage(opts?: { onSuccess?: (r: ChatResponse) => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiChatApi.sendMessage,
    onSuccess: (result) => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      opts?.onSuccess?.(result);
    },
  });
}

export function useDeleteSession(opts?: { onSuccess?: () => void }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: aiChatApi.deleteSession,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: chatKeys.sessions() });
      notifications.show({
        color: "red",
        title: "Session deleted",
        message: "Chat session removed.",
      });
      opts?.onSuccess?.();
    },
  });
}
