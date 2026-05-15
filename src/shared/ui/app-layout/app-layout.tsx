import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AppHeader } from "./app-header";
import { AppNav } from "./app-nav";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [opened, { toggle }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{
        width: 220,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
      data-testid="app-layout"
    >
      <AppShell.Header
        style={{
          borderBottom: "1px solid var(--mantine-color-default-border)",
        }}
      >
        <AppHeader opened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          borderRight: "1px solid var(--mantine-color-default-border)",
        }}
        data-testid="app-nav"
      >
        <AppShell.Section grow component={ScrollArea}>
          <AppNav />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
