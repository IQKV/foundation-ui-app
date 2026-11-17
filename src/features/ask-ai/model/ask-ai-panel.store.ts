import { create } from "zustand";

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
  /** Optional per-page backend endpoint override for sendMessage */
  endpoint: string | null;

  open: () => void;
  close: () => void;
  setSessionId: (id: string) => void;
  clearSession: () => void;
  setContextActions: (actions: AiContextAction[]) => void;
  clearContextActions: () => void;
  setEndpoint: (endpoint: string) => void;
  clearEndpoint: () => void;
}

export const useAskAiPanelStore = create<AskAiPanelState>((set) => ({
  isOpen: false,
  sessionId: null,
  contextActions: [],
  endpoint: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setSessionId: (id) => set({ sessionId: id }),
  clearSession: () => set({ sessionId: null }),
  setContextActions: (actions) => set({ contextActions: actions }),
  clearContextActions: () => set({ contextActions: [] }),
  setEndpoint: (endpoint) => set({ endpoint }),
  clearEndpoint: () => set({ endpoint: null }),
}));
