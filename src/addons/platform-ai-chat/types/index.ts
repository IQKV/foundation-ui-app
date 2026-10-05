export type {
  ChatSession,
  ChatMessage,
  SendMessageRequest,
  ChatResponse,
  SessionListResponse,
  MessageListResponse,
} from "../api/ai-chat-api";

export interface ChatInputValues {
  content: string;
  model: string;
}
