import { AppShell, ScrollArea } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AdminHeader } from "./admin-header";
import { AdminNav } from "./admin-nav";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
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
    >
      <AppShell.Header
        style={{
          borderBottom: "1px solid var(--mantine-color-gray-2)",
          background: "var(--mantine-color-white)",
        }}
      >
        <AdminHeader opened={opened} onToggle={toggle} />
      </AppShell.Header>

      <AppShell.Navbar
        style={{
          borderRight: "1px solid var(--mantine-color-gray-2)",
          background: "var(--mantine-color-gray-0)",
        }}
      >
        <AppShell.Section grow component={ScrollArea}>
          <AdminNav />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main
        style={{
          background: "var(--mantine-color-gray-0)",
          minHeight: "calc(100vh - 56px)",
        }}
      >
        {children}
      </AppShell.Main>
    </AppShell>
  );
}
