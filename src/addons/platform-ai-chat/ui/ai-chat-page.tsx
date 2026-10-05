import { useState } from "react";
import { Group, Text, Stack } from "@mantine/core";
import { Trans } from "@lingui/react/macro";
import { SessionsPanel } from "./sessions-panel";
import { ChatWindow } from "./chat-window";

export function AiChatPage() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);

  return (
    <Stack gap="md" data-testid="ai-chat-page">
      <Text fw={700} size="xl">
        <Trans>AI Chat</Trans>
      </Text>
      <Group align="flex-start" gap="md" style={{ minHeight: "calc(100vh - 160px)" }}>
        <SessionsPanel selectedSessionId={selectedSessionId} onSelect={setSelectedSessionId} />
        <div
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 160px)",
          }}
        >
          <ChatWindow
            sessionId={selectedSessionId}
            onSessionCreated={(id) => setSelectedSessionId(id)}
          />
        </div>
      </Group>
    </Stack>
  );
}
