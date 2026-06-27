import { Card, Group, ThemeIcon, Text } from "@mantine/core";

export interface DashboardStatCardProps {
  icon: React.ReactNode;
  color: string;
  value: React.ReactNode;
  label: React.ReactNode;
}

export function DashboardStatCard({ icon, color, value, label }: DashboardStatCardProps) {
  return (
    <Card withBorder radius="md" p="lg">
      <Group justify="space-between" mb="md">
        <ThemeIcon size="lg" radius="md" variant="light" color={color}>
          {icon}
        </ThemeIcon>
      </Group>
      <Text size="xl" fw={700} mb={4}>
        {value}
      </Text>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Card>
  );
}
