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
  /** Current session id — one conversation per scope, resumed when its page comes back */
  sessionId: string | null;
  /** Context actions registered by the active page */
  contextActions: AiContextAction[];
  /** Optional per-page endpoint override, applied to every AI call while the page is mounted */
  endpoints: ChatEndpoints | null;
  /** Optional venue the active page scopes its conversation to, sent with every turn */
  venueId: string | null;
  /** Key of the persona overlay the user picked, sent with every turn; null for the base assistant */
  personaId: string | null;

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
  setPersonaId: (personaId: string | null) => void;
}

// ─── Session scope ────────────────────────────────────────────────────────────

const SESSION_KEY_PREFIX = "ask_ai_session:";
/** Scope of a conversation grounded on no single venue. */
const WORKSPACE_SCOPE = "workspace";

function sessionKey(venueId: string | null): string {
  return `${SESSION_KEY_PREFIX}${venueId ?? WORKSPACE_SCOPE}`;
}

/** The session last used in this scope, so a venue page picks its conversation back up. */
function readSession(venueId: string | null): string | null {
  try {
    return sessionStorage.getItem(sessionKey(venueId));
  } catch {
    // Storage unavailable (private window) — the panel still works, just not across reloads.
    return null;
  }
}

function writeSession(venueId: string | null, sessionId: string | null): void {
  try {
    if (sessionId) {
      sessionStorage.setItem(sessionKey(venueId), sessionId);
    } else {
      sessionStorage.removeItem(sessionKey(venueId));
    }
  } catch {
    // Ignore storage errors — persistence is best-effort.
  }
}

export const useAskAiPanelStore = create<AskAiPanelState>((set, get) => ({
  isOpen: false,
  sessionId: readSession(null),
  contextActions: [],
  endpoints: null,
  venueId: null,
  personaId: null,

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setSessionId: (id) => {
    writeSession(get().venueId, id);
    set({ sessionId: id });
  },
  clearSession: () => {
    writeSession(get().venueId, null);
    set({ sessionId: null });
  },
  setContextActions: (actions) => set({ contextActions: actions }),
  clearContextActions: () => set({ contextActions: [] }),
  setEndpoints: (endpoints) => set({ endpoints }),
  clearEndpoints: () => set({ endpoints: null }),
  // The scope owns the conversation: each venue carries on with its own thread.
  setVenueId: (venueId) => set({ venueId, sessionId: readSession(venueId) }),
  clearVenueId: () => set({ venueId: null, sessionId: readSession(null) }),
  setPersonaId: (personaId) => set({ personaId }),
}));
