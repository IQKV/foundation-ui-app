import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Text,
  SimpleGrid,
  Card,
  Group,
  ThemeIcon,
  Skeleton,
  Stack,
  Title,
  List,
  Badge,
  Avatar,
  Paper,
  Divider,
} from "@mantine/core";
import {
  IconUsers,
  IconUser,
  IconBuilding,
  IconSettings,
  IconBell,
  IconArrowRight,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { useQuery } from "@tanstack/react-query";
import { pageTitle } from "@/shared/lib/page-title";
import { PageHeader } from "@/shared/ui";
import { iamApi } from "@/shared/api";
import { useSession } from "@/processes/session";

export const Route = createFileRoute("/_app/")({
  component: DashboardPage,
});

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  icon: React.ReactNode;
  color: string;
  value: React.ReactNode;
  label: React.ReactNode;
}

function StatCard({ icon, color, value, label }: StatCardProps) {
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

// ─── Personal workspace welcome ───────────────────────────────────────────────

interface PersonalWelcomeProps {
  firstName: string;
  lastName: string;
  email: string;
}

function PersonalWelcome({ firstName, lastName, email }: PersonalWelcomeProps) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

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

// ─── Page ─────────────────────────────────────────────────────────────────────

function DashboardPage() {
  const { t } = useLingui();
  const { tenantKey, payload, isPersonalWorkspace } = useSession();
  const firstName = payload?.firstName ?? "";
  const lastName = payload?.lastName ?? "";
  const email = payload?.email ?? "";

  // Fetch tenant details — all members should be able to see this.
  const { data: tenant, isLoading: tenantLoading } = useQuery({
    queryKey: ["tenant", tenantKey],
    queryFn: () => iamApi.getTenant(tenantKey!),
    enabled: !!tenantKey,
    retry: false,
  });

  // Fetch member count — not relevant for personal workspaces.
  const { data: membersPage, isLoading: membersLoading } = useQuery({
    queryKey: ["tenant", tenantKey, "members"],
    queryFn: () => iamApi.listMembers(tenantKey!, { size: 1 }),
    enabled: !!tenantKey && !isPersonalWorkspace,
    retry: false,
  });

  const memberCount = membersPage?.totalElements;

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(t`Dashboard`)}</title>
      </Helmet>

      <PageHeader
        title={
          tenantLoading ? (
            <Skeleton height={24} width={180} radius="sm" />
          ) : (
            <Trans>{tenant?.name ?? t`Dashboard`}</Trans>
          )
        }
        breadcrumbs={[{ label: <Trans>Home</Trans> }, { label: <Trans>Dashboard</Trans> }]}
      />

      {isPersonalWorkspace ? (
        /* Personal workspace — welcome card with user info and getting-started guide */
        <PersonalWelcome firstName={firstName} lastName={lastName} email={email} />
      ) : (
        <>
          {/* Greeting */}
          {firstName && (
            <Text c="dimmed" size="sm" mb="lg">
              <Trans>Welcome back, {firstName}.</Trans>
            </Text>
          )}

          {/* Stat cards */}
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
            <StatCard
              icon={<IconUsers size={20} />}
              color="blue"
              value={
                membersLoading ? (
                  <Skeleton height={28} width={48} radius="sm" />
                ) : (
                  (memberCount?.toLocaleString() ?? "—")
                )
              }
              label={<Trans>Team members</Trans>}
            />
          </SimpleGrid>
        </>
      )}
    </Container>
  );
}
