import type { AxiosInstance } from "axios";

let _client: AxiosInstance | null = null;

function client(): AxiosInstance {
  if (!_client) {
    throw new Error("aiChatApi not initialised — call aiChatApi.init(httpClient) first");
  }
  return _client;
}

// ─── DTOs ──────────────────────────────────────────────────────────────────────

export interface ChatSession {
  id: string;
  userId: string;
  title: string | null;
  model: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
}

export interface SendMessageRequest {
  sessionId?: string;
  content: string;
  model?: string;
}

export interface ChatResponse {
  sessionId: string;
  sessionTitle: string | null;
  reply: string;
  model: string;
  timestamp: string;
}

export interface SessionListResponse {
  items: ChatSession[];
  totalElements: number;
}

export interface MessageListResponse {
  items: ChatMessage[];
  totalElements: number;
}

// ─── API ───────────────────────────────────────────────────────────────────────

/**
 * Endpoint override for one call. A field left out falls back to the app-wide default
 * (set in `init`) and then to the built-in `/v1/aichat/chat` routes.
 * `messages` and `delete` templates take a `:sessionId` placeholder.
 */
export interface ChatEndpoints {
  send?: string;
  sessions?: string;
  messages?: string;
  delete?: string;
}

export const DEFAULT_CHAT_ENDPOINTS: Required<ChatEndpoints> = {
  send: "/v1/aichat/chat",
  sessions: "/v1/aichat/chat/sessions",
  messages: "/v1/aichat/chat/sessions/:sessionId/messages",
  delete: "/v1/aichat/chat/sessions/:sessionId",
};

let _appEndpoints: ChatEndpoints = {};

/**
 * Resolve the effective endpoints for a call: built-in defaults, then the app-wide
 * default, then the caller's per-page override.
 */
export function resolveChatEndpoints(override?: ChatEndpoints): Required<ChatEndpoints> {
  return { ...DEFAULT_CHAT_ENDPOINTS, ..._appEndpoints, ...override };
}

function withSessionId(template: string, sessionId: string): string {
  return template.replace(":sessionId", encodeURIComponent(sessionId));
}

export const aiChatApi = {
  init(httpClient: AxiosInstance, endpoints?: ChatEndpoints): void {
    _client = httpClient;
    if (endpoints) {
      _appEndpoints = endpoints;
    }
  },

  sendMessage(body: SendMessageRequest, endpoints?: ChatEndpoints): Promise<ChatResponse> {
    return client()
      .post<ChatResponse>(resolveChatEndpoints(endpoints).send, body)
      .then((r) => r.data);
  },

  getSessions(
    params?: { limit?: number; offset?: number },
    endpoints?: ChatEndpoints,
  ): Promise<SessionListResponse> {
    return client()
      .get<SessionListResponse>(resolveChatEndpoints(endpoints).sessions, { params })
      .then((r) => r.data);
  },

  getMessages(
    sessionId: string,
    params?: { limit?: number; offset?: number },
    endpoints?: ChatEndpoints,
  ): Promise<MessageListResponse> {
    return client()
      .get<MessageListResponse>(
        withSessionId(resolveChatEndpoints(endpoints).messages, sessionId),
        {
          params,
        },
      )
      .then((r) => r.data);
  },

  deleteSession(sessionId: string, endpoints?: ChatEndpoints): Promise<void> {
    return client()
      .delete(withSessionId(resolveChatEndpoints(endpoints).delete, sessionId))
      .then(() => undefined);
  },
};
