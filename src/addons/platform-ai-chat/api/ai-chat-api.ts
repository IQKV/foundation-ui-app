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

const BASE = "/v1/aichat/chat";

export const aiChatApi = {
  init(httpClient: AxiosInstance): void {
    _client = httpClient;
  },

  sendMessage(body: SendMessageRequest): Promise<ChatResponse> {
    return client()
      .post<ChatResponse>(BASE, body)
      .then((r) => r.data);
  },

  getSessions(params?: { limit?: number; offset?: number }): Promise<SessionListResponse> {
    return client()
      .get<SessionListResponse>(`${BASE}/sessions`, { params })
      .then((r) => r.data);
  },

  getMessages(
    sessionId: string,
    params?: { limit?: number; offset?: number },
  ): Promise<MessageListResponse> {
    return client()
      .get<MessageListResponse>(`${BASE}/sessions/${sessionId}/messages`, { params })
      .then((r) => r.data);
  },

  deleteSession(sessionId: string): Promise<void> {
    return client()
      .delete(`${BASE}/sessions/${sessionId}`)
      .then(() => undefined);
  },
};
