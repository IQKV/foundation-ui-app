import { useEffect } from "react";
import { Group, Text, UnstyledButton, Box, Kbd } from "@mantine/core";
import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion, AnimatePresence } from "framer-motion";
import { useAskAiPanelStore } from "@/features/ask-ai/model/ask-ai-panel.store";
import { useCommandBarStore } from "../model/command-bar.store";
import { SpotlightModal } from "./spotlight-modal";

function hoverStyle(e: React.MouseEvent<HTMLButtonElement>, entering: boolean) {
  (e.currentTarget as HTMLButtonElement).style.background = entering
    ? "var(--mantine-color-gray-0)"
    : "transparent";
}

export function CommandBar() {
  const { t } = useLingui();
  const { isVisible, openSpotlight } = useCommandBarStore();
  const { isOpen: aiIsOpen, open: openAi, close: closeAi } = useAskAiPanelStore();

  function toggleAi() {
    aiIsOpen ? closeAi() : openAi();
  }

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

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            key="command-bar"
            data-testid="command-bar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            style={{
              position: "fixed",
              bottom: 24,
              left: "50%",
              translateX: "-50%",
              zIndex: 300,
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
              {/* ── Search zone ──────────────────────────────────────────── */}
              <motion.div whileTap={{ scale: 0.97 }}>
                <UnstyledButton
                  onClick={openSpotlight}
                  aria-label={t`Open spotlight search`}
                  data-testid="command-bar-search"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    height: 44,
                    paddingInline: 16,
                    cursor: "pointer",
                    borderRight: "1px solid var(--mantine-color-gray-2)",
                    transition: "background 100ms ease",
                  }}
                  onMouseEnter={(e) => hoverStyle(e, true)}
                  onMouseLeave={(e) => hoverStyle(e, false)}
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
              </motion.div>

              {/* ── Ask AI zone ──────────────────────────────────────────── */}
              <motion.div whileTap={{ scale: 0.97 }}>
                <UnstyledButton
                  onClick={toggleAi}
                  aria-label={t`Open AI assistant`}
                  aria-pressed={aiIsOpen}
                  data-testid="command-bar-ask-ai"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 44,
                    paddingInline: 14,
                    cursor: "pointer",
                    transition: "background 100ms ease",
                    background: aiIsOpen ? "var(--mantine-color-orange-0, #fff4e6)" : "transparent",
                  }}
                  onMouseEnter={(e) => hoverStyle(e, true)}
                  onMouseLeave={(e) => hoverStyle(e, false)}
                >
                  <IconSparkles size={14} style={{ color: "#e8541a", flexShrink: 0 }} />
                  <Text size="sm" fw={500} style={{ color: "#e8541a", whiteSpace: "nowrap" }}>
                    <Trans>Ask AI</Trans>
                  </Text>
                </UnstyledButton>
              </motion.div>
            </Group>
          </motion.div>
        )}
      </AnimatePresence>

      <SpotlightModal />
    </>
  );
}
