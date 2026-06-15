import { createElement, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Container,
  Group,
  TextInput,
  Paper,
  ActionIcon,
  Tooltip,
  Text,
  Stack,
  Button,
  ThemeIcon,
  Title,
} from "@mantine/core";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import { notifications } from "@mantine/notifications";
import {
  IconBuilding,
  IconPencil,
  IconRefresh,
  IconSearch,
  IconX,
  IconPlus,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi, authApi, type UserMembership } from "@/shared/api";
import { setTokens } from "@/processes/session";
import { PageHeader } from "@/shared/ui";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/settings/organization")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [switchingTenantKey, setSwitchingTenantKey] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => iamApi.listMyMemberships(),
  });

  const exchangeMutation = useMutation({
    mutationFn: ({ tenantKey }: { tenantKey: string; isPersonal: boolean }) =>
      authApi.exchangeTenant(tenantKey),
    onSuccess: async (res, { isPersonal }) => {
      setTokens(res.accessToken, res.refreshToken, res.tenantKey, isPersonal);
      queryClient.removeQueries();
      void navigate({ to: "/team" });
    },
    onError: () => {
      notifications.show({
        title: t`Switch failed`,
        message: t`Could not switch organization.`,
        color: "red",
        icon: createElement(IconX, { size: 16 }),
      });
    },
    onSettled: () => {
      setSwitchingTenantKey(null);
    },
  });

  // isPersonal = true marks the user's personal workspace (backend: Tenant.isInternal).
  // It is hidden from end users — show only real organization memberships.
  // If no real orgs exist at all, fall through to the empty-state CTA.
  const allMemberships = data ?? [];
  const orgMemberships = allMemberships.filter((m) => !m.isPersonal);
  const hasOnlyPersonalWorkspace =
    !isLoading && allMemberships.length > 0 && orgMemberships.length === 0;

  const records = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orgMemberships;
    return orgMemberships.filter((m) => {
      return (
        m.tenantName.toLowerCase().includes(q) ||
        m.tenantKey.toLowerCase().includes(q) ||
        (m.authorities || []).some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [orgMemberships, search]);

  return (
    <Container size="xl" py={0} data-testid={TestSelectors.ORGANIZATION_SETTINGS_PAGE}>
      <Helmet title={pageTitle(t`Organizations`)} />
      <PageHeader
        title={<Trans>Organizations</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Account Settings</Trans> },
          { label: <Trans>Organizations</Trans> },
        ]}
      />

      {/* Empty state: user only has a personal workspace — prompt to create an org */}
      {hasOnlyPersonalWorkspace ? (
        <Paper withBorder radius="md" p="xl">
          <Stack align="center" gap="md" py="xl">
            <ThemeIcon size={56} radius="xl" variant="light" color="blue">
              <IconBuilding size={28} />
            </ThemeIcon>
            <Stack align="center" gap={4}>
              <Title order={4}>
                <Trans>No organizations yet</Trans>
              </Title>
              <Text size="sm" c="dimmed" ta="center" maw={380}>
                <Trans>
                  You're currently using your personal workspace. Create an organization to
                  collaborate with others, manage members, and share resources.
                </Trans>
              </Text>
            </Stack>
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => void navigate({ to: "/create-organization" })}
              data-testid={TestSelectors.ORGANIZATION_SETTINGS_PAGE_CREATE_ORG_BUTTON}
            >
              <Trans>Create Organization</Trans>
            </Button>
          </Stack>
        </Paper>
      ) : (
        <Paper withBorder radius="md" p="md">
          <Group justify="space-between" mb="sm">
            <TextInput
              placeholder={t`Search organizations…`}
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => setSearch(e.currentTarget.value)}
              style={{ width: 320 }}
              data-testid={TestSelectors.ORGANIZATION_SETTINGS_PAGE_SEARCH_INPUT}
            />

            <Tooltip label={t`Refresh`} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => void refetch()}
                loading={isFetching}
                data-testid={TestSelectors.ORGANIZATION_SETTINGS_PAGE_REFRESH_BUTTON}
              >
                <IconRefresh size={16} />
              </ActionIcon>
            </Tooltip>
          </Group>

          <DataTable<UserMembership>
            withTableBorder
            withColumnBorders
            striped
            highlightOnHover
            minHeight={260}
            fetching={isLoading}
            records={records}
            noRecordsText={
              isError
                ? t`Could not load organizations.`
                : search.trim()
                  ? t`No matches.`
                  : t`No organizations found.`
            }
            data-testid={TestSelectors.ORGANIZATION_SETTINGS_PAGE_TABLE}
            columns={[
              {
                accessor: "tenantName",
                title: t`Organization`,
                render: (m) => (
                  <Group gap="xs" wrap="nowrap">
                    <IconBuilding size={16} />
                    <Text size="sm" fw={500}>
                      {m.tenantName}
                    </Text>
                  </Group>
                ),
              },
              { accessor: "tenantKey", title: t`Key`, width: 140 },
              { accessor: "status", title: t`Status`, width: 140 },
              {
                accessor: "authorities",
                title: t`Role`,
                render: (m) => (m.authorities || []).join(", "),
              },
              {
                accessor: "actions",
                title: "",
                width: 64,
                textAlign: "right",
                render: (m) => {
                  const isOwner = (m.authorities || []).includes("TENANT_OWNER");
                  if (!isOwner) {
                    // <ActionIcon variant="subtle" aria-label={t`Leave`}>
                    //   <IconLogout size={16} />
                    // </ActionIcon>
                    return null;
                  }

                  return (
                    <Tooltip label={t`Edit`} withArrow>
                      <ActionIcon
                        variant="subtle"
                        onClick={() => {
                          setSwitchingTenantKey(m.tenantKey);
                          exchangeMutation.mutate({
                            tenantKey: m.tenantKey,
                            isPersonal: m.isPersonal,
                          });
                        }}
                        loading={exchangeMutation.isPending && switchingTenantKey === m.tenantKey}
                        aria-label={t`Edit`}
                      >
                        <IconPencil size={16} />
                      </ActionIcon>
                    </Tooltip>
                  );
                },
              },
            ]}
          />
        </Paper>
      )}
    </Container>
  );
}
