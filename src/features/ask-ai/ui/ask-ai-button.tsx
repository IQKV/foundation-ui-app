import { Button } from "@mantine/core";
import { IconSparkles } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useAskAiPanelStore } from "../model/ask-ai-panel.store";

/**
 * Topbar button that opens the Ask AI drawer.
 * Green accent to visually separate it from the blue primary actions.
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
          background: "linear-gradient(135deg, #5a7a1a 0%, #6b9a1f 100%)",
          border: "1px solid rgba(255,255,255,0.15)",
          color: "#ffffff",
          "&:hover": {
            background: "linear-gradient(135deg, #6b9a1f 0%, #7cb523 100%)",
          },
          "&:active": {
            background: "linear-gradient(135deg, #4d6816 0%, #5a7a1a 100%)",
          },
        },
      }}
    >
      <Trans>Ask AI</Trans>
    </Button>
  );
}
