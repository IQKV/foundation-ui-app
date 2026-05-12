import { Group, Text, Burger, Box, Divider } from "@mantine/core";
import { IconShieldHalf } from "@tabler/icons-react";
import { SignOutButton } from "@/features/sign-out";
import { APP_NAME } from "@/shared/lib/page-title";

interface AdminHeaderProps {
  opened: boolean;
  onToggle: () => void;
}

export function AdminHeader({ opened, onToggle }: AdminHeaderProps) {
  return (
    <Group h="100%" px={0} justify="space-between" gap={0}>
      {/* Brand block — same width as sidebar so content aligns */}
      <Group
        h="100%"
        px="md"
        gap="xs"
        style={{
          width: 220,
          borderRight: "1px solid var(--mantine-color-gray-2)",
          flexShrink: 0,
        }}
      >
        <Burger opened={opened} onClick={onToggle} hiddenFrom="sm" size="sm" />

        <Group gap={8} visibleFrom="sm" style={{ cursor: "default" }}>
          {/* Logo mark */}
          <Box
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--mantine-radius-md)",
              background: "var(--mantine-color-dark-8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <IconShieldHalf size={18} color="white" />
          </Box>

          <Text fw={700} size="sm" c="dark.8" style={{ letterSpacing: "-0.01em" }}>
            {APP_NAME}
          </Text>
        </Group>
      </Group>

      <Divider orientation="vertical" />

      {/* Right side actions */}
      <Group gap="xs" px="md" ml="auto">
        <SignOutButton />
      </Group>
    </Group>
  );
}
