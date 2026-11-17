import { Button } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useAskAiPanelStore } from "../model/ask-ai-panel.store";

/**
 * Topbar button that opens the Ask AI drawer.
 * Deep orange accent to visually separate it from the blue primary actions.
 */
export function AskAiButton() {
  const open = useAskAiPanelStore((s) => s.open);

  return (
    <Button
      variant="filled"
      size="sm"
      leftSection={<IconSparkles size={15} />}
      onClick={open}
      data-testid="ask-ai-button"
      styles={{
        root: {
          background: "linear-gradient(135deg, #c44b0a 0%, #e8541a 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(135deg, #d4530f 0%, #f06030 100%)",
          },
          "&:active": {
            background: "linear-gradient(135deg, #a83d08 0%, #c44b0a 100%)",
          },
        },
      }}
    >
      <Trans>Ask AI</Trans>
    </Button>
  );
}
