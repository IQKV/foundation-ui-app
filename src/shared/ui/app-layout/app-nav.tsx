import { Stack, Text, Box, TextInput, Divider } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useRouterState } from "@tanstack/react-router";
import { useState } from "react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useSession } from "@/processes/session";
import { isMultiTenantMode } from "@/app/config";
import { TenantSwitcher } from "@/features/tenant-switcher";
import { navigationExtension } from "@/app/addons";
import { buildNavSections } from "./nav-config";
import { NavItemRenderer } from "./nav-item-renderer";

/** Uppercase section label styled for the dark sidebar */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text
      size="xs"
      fw={600}
      tt="uppercase"
      lts="0.06em"
      px={14}
      pt={12}
      pb={4}
      style={{
        color: "var(--app-nav-section-label)",
        userSelect: "none",
        fontSize: "0.625rem",
      }}
    >
      {children}
    </Text>
  );
}

export function AppNav() {
  const { t } = useLingui();
  const { isTenantOwner, isPersonalWorkspace, payload } = useSession();
  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const [search, setSearch] = useState("");
  const authorities = payload?.authorities ?? [];
  const canManagePages = authorities.includes("TENANT_OWNER") || authorities.includes("ADMIN");

  const addonItems = navigationExtension.getNavItems("workspace");

  const sections = buildNavSections(
    t,
    {
      isMultiTenantMode,
      isTenantOwner,
      isPersonalWorkspace,
      canManagePages,
    },
    addonItems,
  );

  const allItems = sections.flatMap((s) => s.items);
  const filtered = search.trim()
    ? allItems.filter((item) => item.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <Stack gap={0} py={6}>
      {/* Search */}
      <Box px={10} pb={6}>
        <TextInput
          placeholder={t`Search…`}
          size="xs"
          leftSection={<IconSearch size={13} color="var(--app-nav-search-placeholder)" />}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          styles={{
            input: {
              background: "var(--app-nav-search-bg)",
              border: "1px solid var(--app-nav-search-border)",
              color: "var(--app-nav-search-text)",
              "&::placeholder": { color: "var(--app-nav-search-placeholder)" },
            },
          }}
        />
      </Box>

      {/* Tenant switcher — only when not searching and multi-tenant mode active */}
      {!search.trim() && <TenantSwitcher />}

      {/* Results / full nav */}
      {filtered ? (
        filtered.length > 0 ? (
          filtered.map((item) => <NavItemRenderer key={item.to} item={item} currentPath={currentPath} />)
        ) : (
          <Text size="xs" px="md" py="xs" style={{ color: "var(--app-nav-section-label)" }}>
            <Trans>No results</Trans>
          </Text>
        )
      ) : (
        <>
          {sections.map((section, idx) => (
            <Box key={section.id}>
              {idx > 0 && <Divider mx={10} my={6} style={{ borderColor: "var(--app-nav-divider)" }} />}
              <SectionLabel>{section.label}</SectionLabel>
              {section.items.map((item) => (
                <NavItemRenderer key={item.to} item={item} currentPath={currentPath} />
              ))}
            </Box>
          ))}
        </>
      )}
    </Stack>
  );
}
