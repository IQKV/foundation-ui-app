import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Button,
  Skeleton,
} from "@mantine/core";
import { IconUsers, IconBuilding, IconCreditCard, IconArrowRight } from "@tabler/icons-react";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <Container size="xl" py={0}>
      <PageHeader title="Dashboard" breadcrumbs={[{ label: "Home" }, { label: "Dashboard" }]} />

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="blue">
              <IconUsers size={20} />
            </ThemeIcon>
          </Group>
          <Skeleton visible height={28} width={60} radius="sm" mb={4}>
            <Text size="xl" fw={700}>
              —
            </Text>
          </Skeleton>
          <Text size="sm" c="dimmed">
            Total Users
          </Text>
          <Button
            component={Link}
            to="/admin/users"
            variant="subtle"
            size="xs"
            mt="md"
            px={0}
            rightSection={<IconArrowRight size={14} />}
          >
            Manage users
          </Button>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="violet">
              <IconBuilding size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>
            —
          </Text>
          <Text size="sm" c="dimmed">
            Organizations
          </Text>
          <Text size="xs" c="dimmed" mt="md">
            Coming soon
          </Text>
        </Card>

        <Card withBorder radius="md" p="lg">
          <Group justify="space-between" mb="md">
            <ThemeIcon size="lg" radius="md" variant="light" color="teal">
              <IconCreditCard size={20} />
            </ThemeIcon>
          </Group>
          <Text size="xl" fw={700}>
            —
          </Text>
          <Text size="sm" c="dimmed">
            Active Subscriptions
          </Text>
          <Text size="xs" c="dimmed" mt="md">
            Coming soon
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
