import {
  Paper,
  Stack,
  Group,
  Avatar,
  Title,
  Text,
  Badge,
  Divider,
  List,
  ThemeIcon,
} from "@mantine/core";
import {
  IconBuilding,
  IconUser,
  IconSettings,
  IconBell,
  IconArrowRight,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Trans } from "@lingui/react/macro";

export interface DashboardPersonalWelcomeProps {
  firstName: string;
  lastName: string;
  email: string;
}

export function DashboardPersonalWelcome({
  firstName,
  lastName,
  email,
}: DashboardPersonalWelcomeProps) {
  const initials =
    [firstName, lastName]
      .map((s) => s?.trim().charAt(0) ?? "")
      .join("")
      .toUpperCase() || "?";

  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="lg">
        {/* User identity */}
        <Group gap="md" align="flex-start">
          <Avatar size={56} radius="xl" color="blue" variant="filled">
            {initials}
          </Avatar>
          <Stack gap={2}>
            <Title order={3} fw={700}>
              <Trans>Welcome, {firstName}!</Trans>
            </Title>
            <Text size="sm" c="dimmed">
              {email}
            </Text>
            <Badge variant="light" color="green" size="sm" mt={4} radius="sm">
              <Trans>Personal Workspace</Trans>
            </Badge>
          </Stack>
        </Group>

        <Divider />

        {/* Getting started instructions */}
        <Stack gap="xs">
          <Text fw={600} size="sm">
            <Trans>Here's what you can do from your personal workspace:</Trans>
          </Text>

          <List spacing="sm" size="sm" center>
            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="blue">
                  <IconBuilding size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/create-organization" size="sm" c="blue.6" fw={500}>
                    Create an organization
                  </Text>{" "}
                  to collaborate with your team.
                </Trans>
              </Text>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="violet">
                  <IconUser size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/settings/general" size="sm" c="blue.6" fw={500}>
                    Update your profile
                  </Text>{" "}
                  with your name and avatar.
                </Trans>
              </Text>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="teal">
                  <IconSettings size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/settings/security" size="sm" c="blue.6" fw={500}>
                    Secure your account
                  </Text>{" "}
                  by changing your password.
                </Trans>
              </Text>
            </List.Item>

            <List.Item
              icon={
                <ThemeIcon size={24} radius="xl" variant="light" color="orange">
                  <IconBell size={14} />
                </ThemeIcon>
              }
            >
              <Text size="sm">
                <Trans>
                  <Text component={Link} to="/settings/notifications" size="sm" c="blue.6" fw={500}>
                    Configure notifications
                  </Text>{" "}
                  to stay informed.
                </Trans>
              </Text>
            </List.Item>
          </List>
        </Stack>

        <Group gap="xs" c="dimmed">
          <IconArrowRight size={14} />
          <Text size="xs">
            <Trans>
              Switch between workspaces anytime using the workspace switcher in the sidebar.
            </Trans>
          </Text>
        </Group>
      </Stack>
    </Paper>
  );
}
