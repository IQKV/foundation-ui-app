import { create } from "zustand";
import type { ChatEndpoints } from "@/addons/platform-ai-chat/api/ai-chat-api";

export interface AiContextAction {
  /** Short label shown on the chip / card */
  label: string;
  /** Subtitle / hint shown below the label */
  subtitle?: string;
  /** The message text sent to the AI when the action is clicked */
  message: string;
}

interface AskAiPanelState {
  isOpen: boolean;
  /** Current session id — managed internally, hidden from UX */
  sessionId: string | null;
  /** Context actions registered by the active page */
  contextActions: AiContextAction[];
  /** Optional per-page endpoint override, applied to every AI call while the page is mounted */
  endpoints: ChatEndpoints | null;
  /** Optional venue the active page scopes its conversation to, sent with every turn */
  venueId: string | null;

  open: () => void;
  close: () => void;
  setSessionId: (id: string) => void;
  clearSession: () => void;
  setContextActions: (actions: AiContextAction[]) => void;
  clearContextActions: () => void;
  setEndpoints: (endpoints: ChatEndpoints) => void;
  clearEndpoints: () => void;
  setVenueId: (venueId: string) => void;
  clearVenueId: () => void;
}

export const useAskAiPanelStore = create<AskAiPanelState>((set) => ({
  isOpen: false,
  sessionId: null,
  contextActions: [],
  endpoints: null,
  venueId: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setSessionId: (id) => set({ sessionId: id }),
  clearSession: () => set({ sessionId: null }),
  setContextActions: (actions) => set({ contextActions: actions }),
  clearContextActions: () => set({ contextActions: [] }),
  setEndpoints: (endpoints) => set({ endpoints }),
  clearEndpoints: () => set({ endpoints: null }),
  setVenueId: (venueId) => set({ venueId }),
  clearVenueId: () => set({ venueId: null }),
}));
