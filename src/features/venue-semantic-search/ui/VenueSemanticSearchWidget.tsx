import {
  Paper,
  Text,
  Group,
  TextInput,
  Badge,
  ActionIcon,
  Tooltip,
  Stack,
  Button,
} from "@mantine/core";
import { IconSearch, IconSparkles, IconX } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface VenueSemanticSearchWidgetProps {
  onSearch: (query: string) => void;
  onClear: () => void;
  isSearching?: boolean;
}

const REST_SHADOW = "0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)";
const SEARCH_SHADOW = "0 8px 24px rgba(34,139,230,0.22), 0 2px 6px rgba(34,139,230,0.14)";

/**
 * Natural-language search box for the tenant venue list. The query is handed back on submit
 * (Enter or the search button); the page turns it into a semantic-search request.
 */
export function VenueSemanticSearchWidget({
  onSearch,
  onClear,
  isSearching,
}: VenueSemanticSearchWidgetProps) {
  const { t } = useLingui();
  const reduceMotion = useReducedMotion();
  const [value, setValue] = useState("");
  const [focused, setFocused] = useState(false);

  // Only run the looping "searching" choreography when motion is allowed.
  const isAnimating = Boolean(isSearching) && !reduceMotion;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && value.trim()) {
      onSearch(value.trim());
    }
  };

  const handleClear = () => {
    setValue("");
    onClear();
  };

  return (
    <motion.div
      data-testid={TestSelectors.VENUES_AI_SEARCH_WIDGET}
      initial={reduceMotion ? false : { opacity: 0, y: -16, scale: 0.97 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        boxShadow: isAnimating ? [REST_SHADOW, SEARCH_SHADOW, REST_SHADOW] : REST_SHADOW,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 26,
        boxShadow: isAnimating
          ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
          : { duration: 0.4, ease: "easeOut" },
      }}
      style={{
        borderRadius: "var(--mantine-radius-md)",
        marginBottom: "var(--mantine-spacing-lg)",
      }}
    >
      <Paper
        withBorder
        p="md"
        radius="md"
        style={{
          background: "linear-gradient(to right, #f8f9fa, #ffffff)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Flowing gradient accent bar on the left edge */}
        <motion.div
          animate={
            isAnimating
              ? { backgroundPosition: ["0% 0%", "0% 200%"] }
              : { backgroundPosition: "0% 0%" }
          }
          transition={
            isAnimating
              ? { duration: 2.2, repeat: Infinity, ease: "linear" }
              : { duration: 0.6, ease: "easeOut" }
          }
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            bottom: 0,
            width: 4,
            zIndex: 1,
            backgroundImage:
              "linear-gradient(180deg, var(--mantine-color-blue-filled) 0%, var(--mantine-color-cyan-filled) 50%, var(--mantine-color-blue-filled) 100%)",
            backgroundSize: "100% 200%",
          }}
        />

        {/* Light sweep that travels across the card while a search is running */}
        {isAnimating && (
          <motion.div
            initial={{ x: "-150%" }}
            animate={{ x: "400%" }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              repeatDelay: 0.3,
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: "35%",
              zIndex: 0,
              pointerEvents: "none",
              background: "linear-gradient(90deg, transparent, rgba(34,139,230,0.12), transparent)",
            }}
          />
        )}

        <Stack gap="xs" style={{ position: "relative", zIndex: 1 }}>
          <Group justify="space-between" align="center">
            <Group gap="xs">
              <motion.div
                animate={
                  isAnimating
                    ? { rotate: [0, 14, -8, 0], scale: [1, 1.18, 1] }
                    : { rotate: 0, scale: 1 }
                }
                transition={
                  isAnimating
                    ? { duration: 2.4, repeat: Infinity, ease: "easeInOut" }
                    : { type: "spring", stiffness: 400, damping: 20 }
                }
                style={{ display: "inline-flex" }}
              >
                <Badge
                  variant="light"
                  color="blue"
                  leftSection={<IconSparkles size={12} />}
                  size="sm"
                >
                  <Trans>Beta</Trans>
                </Badge>
              </motion.div>
              <Text size="sm" fw={500} c="dimmed">
                <Trans>Semantic Search — Ask anything about your venues in natural language</Trans>
              </Text>
            </Group>
            <AnimatePresence initial={false}>
              {value && (
                <motion.div
                  initial={{ opacity: 0, x: 12, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 12, scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 420, damping: 28 }}
                >
                  <Button
                    variant="subtle"
                    color="gray"
                    size="xs"
                    onClick={handleClear}
                    leftSection={<IconX size={14} />}
                    data-testid={TestSelectors.VENUES_AI_SEARCH_CLEAR_BUTTON}
                  >
                    <Trans>Clear AI search</Trans>
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Group>

          <motion.div
            animate={{
              y: focused && !reduceMotion ? -1 : 0,
              boxShadow: focused ? "0 0 0 3px rgba(34,139,230,0.14)" : "0 0 0 0 rgba(34,139,230,0)",
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            style={{ borderRadius: "var(--mantine-radius-md)" }}
          >
            <TextInput
              size="md"
              placeholder={t`e.g. "Find venues in Berlin with a rooftop terrace and space for 200 guests"`}
              leftSection={<IconSearch size={20} style={{ opacity: 0.5 }} />}
              value={value}
              data-testid={TestSelectors.VENUES_AI_SEARCH_INPUT}
              onChange={(e) => setValue(e.currentTarget.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              rightSection={
                <Group gap={4} px="xs">
                  <motion.div
                    whileHover={reduceMotion ? undefined : { scale: 1.12 }}
                    whileTap={reduceMotion ? undefined : { scale: 0.9 }}
                    animate={isAnimating ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                    transition={
                      isAnimating
                        ? { duration: 1.6, repeat: Infinity, ease: "easeInOut" }
                        : { type: "spring", stiffness: 420, damping: 22 }
                    }
                    style={{ display: "flex" }}
                  >
                    <Tooltip label={t`Press Enter to search`} withArrow>
                      <ActionIcon
                        variant="filled"
                        color="blue"
                        onClick={() => value.trim() && onSearch(value.trim())}
                        loading={isSearching}
                        disabled={!value.trim()}
                      >
                        <IconSearch size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </motion.div>
                </Group>
              }
              styles={{
                input: {
                  borderRadius: "var(--mantine-radius-md)",
                  border: "1px solid var(--mantine-color-gray-3)",
                  "&:focus": {
                    borderColor: "var(--mantine-color-blue-filled)",
                  },
                },
              }}
            />
          </motion.div>

          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.35, ease: "easeOut" }}
          >
            <Text size="xs" c="dimmed" fs="italic">
              <Trans>
                Pro tip: You can search by vibe, amenities, capacity, or specific location details.
              </Trans>
            </Text>
          </motion.div>
        </Stack>
      </Paper>
    </motion.div>
  );
}
