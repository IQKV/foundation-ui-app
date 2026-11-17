import { useEffect } from "react";
import { Group, Text, UnstyledButton, Box, Divider, Kbd, Tooltip } from "@mantine/core";
import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useAskAiPanelStore } from "@/features/ask-ai/model/ask-ai-panel.store";
import { useCommandBarStore } from "../model/command-bar.store";
import { SpotlightModal } from "./spotlight-modal";

export function CommandBar() {
  const { t } = useLingui();
  const { isVisible, openSpotlight, actions } = useCommandBarStore();
  const openAi = useAskAiPanelStore((s) => s.open);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        openSpotlight();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSpotlight]);

  if (!isVisible) return <SpotlightModal />;

  const hasActions = actions.length > 0;

  return (
    <>
      <Box
        data-testid="command-bar"
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 300,
          // Prevent bar from overflowing on small screens
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        <Group
          gap={0}
          style={{
            height: 44,
            borderRadius: 999,
            background: "var(--mantine-color-white)",
            border: "1px solid var(--mantine-color-gray-3)",
            boxShadow: "0 4px 16px rgba(17,28,43,0.12), 0 1px 3px rgba(17,28,43,0.08)",
            overflow: "hidden",
            userSelect: "none",
          }}
        >
          {/* ── Search zone ──────────────────────────────────────────────── */}
          <UnstyledButton
            onClick={openSpotlight}
            aria-label={t`Open spotlight search`}
            data-testid="command-bar-search"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: "100%",
              paddingInline: 16,
              cursor: "pointer",
              borderRight: "1px solid var(--mantine-color-gray-2)",
              transition: "background 100ms ease",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--mantine-color-gray-0)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <IconSearch size={14} color="var(--mantine-color-gray-5)" />
            <Text size="sm" c="dimmed" style={{ whiteSpace: "nowrap" }}>
              <Trans>Jump to a page…</Trans>
            </Text>
            <Group gap={4} ml={8}>
              <Kbd size="xs" style={{ lineHeight: 1.6 }}>
                Ctrl
              </Kbd>
              <Kbd size="xs" style={{ lineHeight: 1.6 }}>
                K
              </Kbd>
            </Group>
          </UnstyledButton>

          {/* ── Ask AI zone ───────────────────────────────────────────────── */}
          <UnstyledButton
            onClick={openAi}
            aria-label={t`Open AI assistant`}
            data-testid="command-bar-ask-ai"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              height: "100%",
              paddingInline: 14,
              cursor: "pointer",
              transition: "background 100ms ease",
              borderRight: hasActions ? "1px solid var(--mantine-color-gray-2)" : undefined,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "var(--mantine-color-gray-0)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            <IconSparkles size={14} style={{ color: "#6b9a1f", flexShrink: 0 }} />
            <Text size="sm" fw={500} style={{ color: "#6b9a1f", whiteSpace: "nowrap" }}>
              <Trans>Ask AI</Trans>
            </Text>
          </UnstyledButton>

          {/* ── Page-level actions ────────────────────────────────────────── */}
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Tooltip key={action.id} label={action.label} position="top" withArrow>
                <UnstyledButton
                  onClick={action.onClick}
                  aria-label={action.label}
                  data-testid={`command-bar-action-${action.id}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: "100%",
                    paddingInline: 14,
                    cursor: "pointer",
                    borderLeft: "1px solid var(--mantine-color-gray-2)",
                    transition: "background 100ms ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background =
                      "var(--mantine-color-gray-0)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  {Icon && <Icon size={14} />}
                  <Text size="sm" fw={500} style={{ whiteSpace: "nowrap" }}>
                    {action.label}
                  </Text>
                </UnstyledButton>
              </Tooltip>
            );
          })}
        </Group>
      </Box>

      <SpotlightModal />
    </>
  );
}
