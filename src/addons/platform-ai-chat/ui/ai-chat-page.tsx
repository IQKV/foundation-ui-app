import { useState } from "react";
import { Group, Paper, Text, Stack } from "@mantine/core";
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
      <Group align="flex-start" gap="md" style={{ minHeight: "calc(100vh - 220px)" }}>
        <SessionsPanel selectedSessionId={selectedSessionId} onSelect={setSelectedSessionId} />
        <Paper
          withBorder
          radius="xl"
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            height: "calc(100vh - 220px)",
            overflow: "hidden",
            background:
              "radial-gradient(ellipse 120% 100% at 50% 50%, #e4e8ef 0%, #d0d6e2 60%, #b0bac9 100%)",
            boxShadow: "4px 4px 0px #8896aa",
          }}
        >
          <ChatWindow
            sessionId={selectedSessionId}
            onSessionCreated={(id) => setSelectedSessionId(id)}
          />
        </Paper>
      </Group>
    </Stack>
  );
}
