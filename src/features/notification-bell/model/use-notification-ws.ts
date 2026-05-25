/**
 * useNotificationWs — manages the STOMP/SockJS WebSocket connection lifecycle.
 *
 * Connects on mount, subscribes to:
 *   - /user/queue/notifications  → personal notification pushes
 *   - /topic/announcements       → global announcement broadcasts
 *
 * On each incoming message, bumps pushSeq in the store, which causes
 * useNotificationList and useUnreadCount to re-fetch via their queryKey dependency.
 *
 * The JWT is passed in the STOMP CONNECT frame headers (not the HTTP handshake)
 * because SockJS does not reliably forward the Authorization header.
 *
 * Disconnects and cleans up on unmount.
 */
import { useEffect, useRef } from "react";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { getConfig } from "@/app/config";
import { getAccessToken } from "@/processes/session";
import { useNotificationStore } from "./notification.store";

const isDev = import.meta.env.DEV;

function resolveWsUrl(): string {
  const base = isDev ? "" : (getConfig("VITE_API_SERVER_URL") ?? "");
  // Strip trailing /api if present — the WS endpoint is at /api/v1/iam/ws
  const origin = base.replace(/\/api$/, "");
  return `${origin}/api/v1/iam/ws`;
}

export function useNotificationWs() {
  const { setStompClient, setWsStatus, bumpPushSeq } = useNotificationStore();
  // Keep a stable ref so the cleanup closure always sees the latest client
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    const token = getAccessToken();

    // No token — unauthenticated context (tests, pre-login render). Skip connection.
    if (!token) return;

    const wsUrl = resolveWsUrl();

    const client = new Client({
      // SockJS factory — used instead of a raw WebSocket URL
      webSocketFactory: () => new SockJS(wsUrl) as WebSocket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5_000,
      heartbeatIncoming: 10_000,
      heartbeatOutgoing: 10_000,

      onConnect: () => {
        setWsStatus("connected");

        // Personal notification push
        client.subscribe("/user/queue/notifications", () => {
          bumpPushSeq();
        });

        // Global announcement broadcast
        client.subscribe("/topic/announcements", () => {
          bumpPushSeq();
        });
      },

      onDisconnect: () => {
        setWsStatus("disconnected");
      },

      onStompError: (frame) => {
        console.error("[notification-ws] STOMP error", frame.headers["message"]);
        setWsStatus("error");
      },

      onWebSocketError: (event) => {
        console.error("[notification-ws] WebSocket error", event);
        setWsStatus("error");
      },
    });

    setWsStatus("connecting");
    client.activate();
    clientRef.current = client;
    setStompClient(client);

    return () => {
      void client.deactivate();
      clientRef.current = null;
      setStompClient(null);
      setWsStatus("disconnected");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — connect once per mount
}
