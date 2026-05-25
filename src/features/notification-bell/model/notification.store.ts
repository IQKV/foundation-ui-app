/**
 * Notification store — manages WebSocket lifecycle and real-time push state.
 *
 * The store owns the STOMP client so it is created once and shared across
 * all components that subscribe to it. TanStack Query owns the REST cache;
 * the store only holds the live-push overlay (unread count bump + latest
 * pushed item) and the connection status.
 */
import { create } from "zustand";
import type { Client } from "@stomp/stompjs";

export type WsStatus = "disconnected" | "connecting" | "connected" | "error";

interface NotificationStoreState {
  /** STOMP client instance — null until connect() is called. */
  stompClient: Client | null;
  wsStatus: WsStatus;
  /**
   * Incremented each time a WebSocket push arrives.
   * Components use this as a TanStack Query invalidation signal.
   */
  pushSeq: number;

  setStompClient: (client: Client | null) => void;
  setWsStatus: (status: WsStatus) => void;
  bumpPushSeq: () => void;
}

export const useNotificationStore = create<NotificationStoreState>((set) => ({
  stompClient: null,
  wsStatus: "disconnected",
  pushSeq: 0,

  setStompClient: (client) => set({ stompClient: client }),
  setWsStatus: (status) => set({ wsStatus: status }),
  bumpPushSeq: () => set((s) => ({ pushSeq: s.pushSeq + 1 })),
}));
