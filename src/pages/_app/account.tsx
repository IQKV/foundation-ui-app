import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Text,
  Stack,
  Group,
  Box,
  Paper,
  Skeleton,
  Alert,
  ThemeIcon,
  SimpleGrid,
  Avatar,
  Badge,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import { useDisclosure } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconMail,
  IconCalendar,
  IconRefresh,
  IconEdit,
  IconShieldCheck,
  IconBuilding,
  IconShieldHalf,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi } from "@/shared/api";
import { UserStatusBadge, PageHeader } from "@/shared/ui";
import { EditProfileModal } from "@/features/edit-profile";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/_app/account")({
  component: AccountPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avatarColor(str: string): string {
  const colors = ["blue", "cyan", "teal", "green", "violet", "grape", "pink", "orange", "red"];
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}

function initials(first: string, last: string): string {
  return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: React.ReactNode;
  value: React.ReactNode;
  isLoading?: boolean;
}

function StatCard({ label, value, isLoading }: StatCardProps) {
  return (
    <Stack gap={4} align="center" py="md">
      {isLoading ? (
        <Skeleton height={28} width={60} radius="sm" />
      ) : (
        <Text size="xl" fw={700} lh={1}>
          {value}
        </Text>
      )}
      <Text size="xs" c="dimmed" tt="uppercase" fw={500} lts={0.5}>
        {label}
      </Text>
    </Stack>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AccountPage() {
  const { t } = useLingui();

  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);

  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => iamApi.getMe(),
  });

  const displayName = profile ? `${profile.firstName} ${profile.lastName}` : t`My Account`;

  if (isError) {
    return (
      <Container size="xl" py={0}>
        <PageHeader
          title={<Trans>My Account</Trans>}
          breadcrumbs={[
            { label: <Trans>Home</Trans>, to: "/" },
            { label: <Trans>My Account</Trans> },
          ]}
        />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={<Trans>Failed to load profile</Trans>}
          color="red"
          variant="light"
        >
          <Trans>Could not fetch your account details.</Trans>{" "}
          <Text
            component="span"
            size="sm"
            c="red"
            style={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => void refetch()}
          >
            <Trans>Retry</Trans>
          </Text>
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl" py={0}>
      <Helmet>
        <title>{pageTitle(isLoading ? t`My Account` : displayName)}</title>
      </Helmet>

      <PageHeader
        title={<Trans>My Account</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>My Account</Trans> },
        ]}
        toolbar={
          <Group gap="xs">
            <Tooltip label={t`Edit profile`} withArrow>
              <ActionIcon
                variant="light"
                color="blue"
                size="md"
                onClick={openEdit}
                disabled={isLoading}
              >
                <IconEdit size={15} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="md"
                onClick={() => void refetch()}
                loading={isLoading}
              >
                <IconRefresh size={15} />
              </ActionIcon>
            </Tooltip>
          </Group>
        }
      />

      {/* ── Hero card ───────────────────────────────────────────────────── */}
      <Paper withBorder radius="md" p="xl" mb="md">
        <Stack align="center" gap="xs">
          {isLoading ? (
            <Skeleton circle height={72} width={72} />
          ) : (
            <Avatar
              size={72}
              radius="xl"
              color={profile ? avatarColor(profile.email) : "gray"}
              variant="filled"
              style={{ border: "3px solid var(--mantine-color-blue-3)" }}
            >
              {profile ? initials(profile.firstName, profile.lastName) : "?"}
            </Avatar>
          )}

          <Group gap="xs" align="center">
            {isLoading ? (
              <Skeleton height={24} width={180} radius="sm" />
            ) : (
              <Text size="xl" fw={700}>
                {displayName}
              </Text>
            )}
            {!isLoading && profile && <UserStatusBadge status={profile.status} />}
          </Group>

          <Group gap="lg" justify="center" wrap="wrap">
            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconMail size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={160} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  {profile?.email}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconShieldCheck size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Badge variant="dot" color={profile?.emailVerified ? "green" : "orange"} size="sm">
                  {profile?.emailVerified ? (
                    <Trans>Email verified</Trans>
                  ) : (
                    <Trans>Email unverified</Trans>
                  )}
                </Badge>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconCalendar size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={100} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  <Trans>Joined</Trans>{" "}
                  {profile ? dayjs(profile.createdAt).format("MMM D, YYYY") : "—"}
                </Text>
              )}
            </Group>

            <Group gap={6}>
              <ThemeIcon size="xs" variant="transparent" color="gray">
                <IconBuilding size={13} />
              </ThemeIcon>
              {isLoading ? (
                <Skeleton height={14} width={80} radius="sm" />
              ) : (
                <Text size="sm" c="dimmed">
                  {profile?.organizations?.length ?? 0} <Trans>organization(s)</Trans>
                </Text>
              )}
            </Group>
          </Group>
        </Stack>
      </Paper>

      {/* ── Stats bar ───────────────────────────────────────────────────── */}
      <Paper withBorder radius="md" mb="md" style={{ overflow: "hidden" }}>
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing={0}>
          <StatCard
            label={<Trans>Organizations</Trans>}
            value={profile?.organizations?.length ?? 0}
            isLoading={isLoading}
          />
          <StatCard
            label={<Trans>Email</Trans>}
            value={
              profile ? (
                <Badge
                  variant="light"
                  color={profile.emailVerified ? "green" : "orange"}
                  size="sm"
                  radius="sm"
                >
                  {profile.emailVerified ? <Trans>Verified</Trans> : <Trans>Unverified</Trans>}
                </Badge>
              ) : (
                "—"
              )
            }
            isLoading={isLoading}
          />
          <StatCard
            label={<Trans>Joined</Trans>}
            value={profile ? dayjs(profile.createdAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
          <StatCard
            label={<Trans>Last updated</Trans>}
            value={profile?.updatedAt ? dayjs(profile.updatedAt).format("MMM D, YYYY") : "—"}
            isLoading={isLoading}
          />
        </SimpleGrid>
      </Paper>

      {/* ── Organizations ────────────────────────────────────────────────── */}
      <Paper withBorder radius="md" mb="md" style={{ overflow: "hidden" }}>
        <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <IconBuilding size={15} color="var(--mantine-color-gray-6)" />
          <Text fw={600} size="sm">
            <Trans>Organizations</Trans>
          </Text>
          {!isLoading && (
            <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
              {profile?.organizations?.length ?? 0}
            </Badge>
          )}
        </Group>

        {isLoading ? (
          <Stack gap={0}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Box
                key={i}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Skeleton circle height={32} width={32} />
                  <Skeleton height={12} width="40%" radius="sm" />
                </Group>
              </Box>
            ))}
          </Stack>
        ) : !profile?.organizations || profile.organizations.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
            <Trans>You are not a member of any organization.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {profile.organizations.map((orgName) => (
              <Box
                key={orgName}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--mantine-color-blue-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconBuilding size={16} color="var(--mantine-color-blue-6)" />
                  </Box>
                  <Text size="sm" fw={500}>
                    {orgName}
                  </Text>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      {/* ── Membership authorities ───────────────────────────────────────── */}
      <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
        <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
          <IconShieldHalf size={15} color="var(--mantine-color-gray-6)" />
          <Text fw={600} size="sm">
            <Trans>Roles</Trans>
          </Text>
          {!isLoading && (
            <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
              {profile?.membershipAuthorities?.length ?? 0}
            </Badge>
          )}
        </Group>

        {isLoading ? (
          <Stack gap={0}>
            {Array.from({ length: 2 }).map((_, i) => (
              <Box
                key={i}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Skeleton height={12} width="25%" radius="sm" />
              </Box>
            ))}
          </Stack>
        ) : !profile?.membershipAuthorities || profile.membershipAuthorities.length === 0 ? (
          <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
            <Trans>No roles assigned.</Trans>
          </Text>
        ) : (
          <Stack gap={0}>
            {profile.membershipAuthorities.map((authority) => (
              <Box
                key={authority}
                px="md"
                py="sm"
                style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
              >
                <Group gap="sm">
                  <Box
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: "50%",
                      background: "var(--mantine-color-violet-1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <IconShieldHalf size={16} color="var(--mantine-color-violet-6)" />
                  </Box>
                  <Text size="sm" fw={500} ff="monospace">
                    {authority}
                  </Text>
                </Group>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <EditProfileModal profile={profile ?? null} opened={editOpened} onClose={closeEdit} />
    </Container>
  );
}
