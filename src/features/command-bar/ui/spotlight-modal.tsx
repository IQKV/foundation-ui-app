import { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Box, Group, Text, TextInput, UnstyledButton, Divider, Stack } from "@mantine/core";
import { IconSearch, IconArrowRight, IconCornerDownLeft } from "@tabler/icons-react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { Trans, useLingui } from "@lingui/react/macro";
import { navigationExtension } from "@/app/addons";
import { useSession } from "@/processes/session";
import { isMultiTenantMode } from "@/app/config";
import { buildNavSections } from "@/shared/ui/app-layout/nav-config";
import { useCommandBarStore, type CommandBarAction } from "../model/command-bar.store";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SpotlightItem {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

// ─── Row ──────────────────────────────────────────────────────────────────────

interface SpotlightRowProps {
  item: SpotlightItem;
  isActive: boolean;
  onSelect: () => void;
  onHover: () => void;
  itemRef: (el: HTMLButtonElement | null) => void;
}

function SpotlightRow({ item, isActive, onSelect, onHover, itemRef }: SpotlightRowProps) {
  return (
    <UnstyledButton
      ref={itemRef}
      onClick={onSelect}
      onMouseEnter={onHover}
      data-testid="spotlight-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "8px 16px",
        borderRadius: "var(--mantine-radius-sm)",
        background: isActive ? "var(--mantine-color-gray-1)" : "transparent",
        transition: "background 80ms ease",
        cursor: "pointer",
      }}
    >
      {item.icon && (
        <Box style={{ width: 20, flexShrink: 0, color: "var(--mantine-color-gray-6)" }}>
          {item.icon}
        </Box>
      )}
      <Box style={{ flex: 1, minWidth: 0 }}>
        <Text size="sm" fw={isActive ? 500 : 400} truncate>
          {item.label}
        </Text>
        {item.subtitle && (
          <Text size="xs" c="dimmed" truncate>
            {item.subtitle}
          </Text>
        )}
      </Box>
    </UnstyledButton>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="xs"
      fw={600}
      c="dimmed"
      tt="uppercase"
      px="md"
      pt="sm"
      pb={4}
      style={{ letterSpacing: "0.06em" }}
    >
      {children}
    </Text>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────

export function SpotlightModal() {
  const { t } = useLingui();
  const { isSpotlightOpen, closeSpotlight, actions: pageActions } = useCommandBarStore();
  const navigate = useNavigate();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { isTenantOwner, isPersonalWorkspace, payload } = useSession();
  const canManagePages = (payload?.authorities ?? []).some(
    (a) => a === "TENANT_OWNER" || a === "ADMIN",
  );

  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Build GO TO items from nav config
  const addonItems = navigationExtension.getNavItems("workspace");
  const sections = buildNavSections(
    { isMultiTenantMode, isTenantOwner, isPersonalWorkspace, canManagePages },
    addonItems,
  );
  const allNavItems = sections.flatMap((s) => s.items);

  const q = query.trim().toLowerCase();

  const gotoItems: SpotlightItem[] = allNavItems
    .filter((item) => !q || String(item.label).toLowerCase().includes(q))
    .map((item) => ({
      id: `goto-${item.to}`,
      label: typeof item.label === "string" ? item.label : item.to,
      icon: <item.icon size={14} />,
      onSelect: () => {
        void navigate({ to: item.to });
        closeSpotlight();
      },
    }));

  const actionItems: SpotlightItem[] = pageActions
    .filter((a: CommandBarAction) => !q || a.label.toLowerCase().includes(q))
    .map((a: CommandBarAction) => ({
      id: `action-${a.id}`,
      label: a.label,
      icon: a.icon ? <a.icon size={14} /> : undefined,
      onSelect: () => {
        a.onClick();
        closeSpotlight();
      },
    }));

  // Flat list for keyboard navigation
  const allItems: SpotlightItem[] = [...actionItems, ...gotoItems];

  // Reset state on open
  useEffect(() => {
    if (isSpotlightOpen) {
      setQuery("");
      setActiveIndex(0);
      rowRefs.current = [];
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isSpotlightOpen]);

  // Keep active row scrolled into view
  useEffect(() => {
    rowRefs.current[activeIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleSelect = useCallback(
    (index: number) => {
      allItems[index]?.onSelect();
    },
    [allItems],
  );

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(activeIndex);
    } else if (e.key === "Escape") {
      closeSpotlight();
    }
  }

  // Reset active index when query changes
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Build flat index map for section rendering
  let flatIndex = 0;
  const actionStart = 0;
  const gotoStart = actionItems.length;

  return (
    <Modal
      opened={isSpotlightOpen}
      onClose={closeSpotlight}
      withCloseButton={false}
      padding={0}
      radius="md"
      size={520}
      overlayProps={{ backgroundOpacity: 0.25, blur: 2 }}
      styles={{
        content: { overflow: "hidden" },
        body: { padding: 0 },
      }}
      data-testid="spotlight-modal"
    >
      {/* Search input */}
      <Box px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap="xs">
          <IconSearch size={16} color="var(--mantine-color-gray-5)" style={{ flexShrink: 0 }} />
          <TextInput
            ref={inputRef}
            variant="unstyled"
            flex={1}
            placeholder={t`Search pages, actions…`}
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            onKeyDown={handleKeyDown}
            styles={{ input: { fontSize: "var(--mantine-font-size-sm)", padding: 0 } }}
            data-testid="spotlight-input"
          />
          <Text size="xs" c="dimmed">
            Esc
          </Text>
        </Group>
      </Box>

      {/* Results */}
      <Box style={{ maxHeight: 400, overflowY: "auto" }} py="xs">
        {allItems.length === 0 && (
          <Text size="sm" c="dimmed" ta="center" py="xl">
            <Trans>No results</Trans>
          </Text>
        )}

        {actionItems.length > 0 && (
          <>
            <SectionLabel>
              <Trans>Actions</Trans>
            </SectionLabel>
            {actionItems.map((item, i) => {
              const idx = actionStart + i;
              const ref = (el: HTMLButtonElement | null) => {
                rowRefs.current[idx] = el;
              };
              return (
                <SpotlightRow
                  key={item.id}
                  item={item}
                  isActive={activeIndex === idx}
                  onSelect={() => handleSelect(idx)}
                  onHover={() => setActiveIndex(idx)}
                  itemRef={ref}
                />
              );
            })}
          </>
        )}

        {gotoItems.length > 0 && (
          <>
            <SectionLabel>
              <Trans>Go to</Trans>
            </SectionLabel>
            {gotoItems.map((item, i) => {
              const idx = gotoStart + i;
              const ref = (el: HTMLButtonElement | null) => {
                rowRefs.current[idx] = el;
              };
              return (
                <SpotlightRow
                  key={item.id}
                  item={item}
                  isActive={activeIndex === idx}
                  onSelect={() => handleSelect(idx)}
                  onHover={() => setActiveIndex(idx)}
                  itemRef={ref}
                />
              );
            })}
          </>
        )}
      </Box>

      {/* Footer */}
      <Box px="md" py="xs" style={{ borderTop: "1px solid var(--mantine-color-gray-2)" }}>
        <Group gap="lg">
          <Group gap={4}>
            <IconCornerDownLeft size={12} color="var(--mantine-color-gray-5)" />
            <Text size="xs" c="dimmed">
              <Trans>open</Trans>
            </Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              ↑↓
            </Text>
            <Text size="xs" c="dimmed">
              <Trans>navigate</Trans>
            </Text>
          </Group>
          <Group gap={4}>
            <Text size="xs" c="dimmed">
              Esc
            </Text>
            <Text size="xs" c="dimmed">
              <Trans>close</Trans>
            </Text>
          </Group>
        </Group>
      </Box>
    </Modal>
  );
}
