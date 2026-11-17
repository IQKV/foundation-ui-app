import { useEffect } from "react";
import { Group, Text, UnstyledButton, Box, Kbd, Tooltip } from "@mantine/core";
import { IconSearch, IconSparkles } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { motion, AnimatePresence } from "framer-motion";
import { useAskAiPanelStore } from "@/features/ask-ai/model/ask-ai-panel.store";
import { useCommandBarStore } from "../model/command-bar.store";
import { SpotlightModal } from "./spotlight-modal";

// Shared hover style helper — avoids repeated inline handler pairs
function hoverStyle(e: React.MouseEvent<HTMLButtonElement>, entering: boolean) {
  (e.currentTarget as HTMLButtonElement).style.background = entering
    ? "var(--mantine-color-gray-0)"
    : "transparent";
}

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

  const hasActions = actions.length > 0;

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
                  onClick={openAi}
                  aria-label={t`Open AI assistant`}
                  data-testid="command-bar-ask-ai"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    height: 44,
                    paddingInline: 14,
                    cursor: "pointer",
                    transition: "background 100ms ease",
                    borderRight: hasActions ? "1px solid var(--mantine-color-gray-2)" : undefined,
                  }}
                  onMouseEnter={(e) => hoverStyle(e, true)}
                  onMouseLeave={(e) => hoverStyle(e, false)}
                >
                  <IconSparkles size={14} style={{ color: "#6b9a1f", flexShrink: 0 }} />
                  <Text size="sm" fw={500} style={{ color: "#6b9a1f", whiteSpace: "nowrap" }}>
                    <Trans>Ask AI</Trans>
                  </Text>
                </UnstyledButton>
              </motion.div>

              {/* ── Page-level actions (animate in/out individually) ──────── */}
              <AnimatePresence initial={false}>
                {actions.map((action) => {
                  const Icon = action.icon;
                  return (
                    <motion.div
                      key={action.id}
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ type: "spring", stiffness: 340, damping: 28 }}
                      style={{ overflow: "hidden" }}
                    >
                      <Tooltip label={action.label} position="top" withArrow>
                        <motion.div whileTap={{ scale: 0.97 }}>
                          <UnstyledButton
                            onClick={action.onClick}
                            aria-label={action.label}
                            data-testid={`command-bar-action-${action.id}`}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              height: 44,
                              paddingInline: 14,
                              cursor: "pointer",
                              borderLeft: "1px solid var(--mantine-color-gray-2)",
                              transition: "background 100ms ease",
                              whiteSpace: "nowrap",
                            }}
                            onMouseEnter={(e) => hoverStyle(e, true)}
                            onMouseLeave={(e) => hoverStyle(e, false)}
                          >
                            {Icon && <Icon size={14} />}
                            <Text size="sm" fw={500}>
                              {action.label}
                            </Text>
                          </UnstyledButton>
                        </motion.div>
                      </Tooltip>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Group>
          </motion.div>
        )}
      </AnimatePresence>

      <SpotlightModal />
    </>
  );
}
