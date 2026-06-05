import { createElement, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Container, Group, TextInput, Paper, ActionIcon, Tooltip, Text } from "@mantine/core";
import { useQuery, useMutation } from "@tanstack/react-query";
import { DataTable } from "mantine-datatable";
import { notifications } from "@mantine/notifications";
import { IconBuilding, IconPencil, IconRefresh, IconSearch, IconX } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi, authApi, type UserMembership } from "@/shared/api";
import { setTokens } from "@/processes/session";
import { PageHeader } from "@/shared/ui";

export const Route = createFileRoute("/_app/settings/organization")({
  component: OrganizationsPage,
});

function OrganizationsPage() {
  const { t } = useLingui();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [switchingTenantKey, setSwitchingTenantKey] = useState<string | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["my-memberships"],
    queryFn: () => iamApi.listMyMemberships(),
  });

  const exchangeMutation = useMutation({
    mutationFn: (tenantKey: string) => authApi.exchangeTenant(tenantKey),
    onSuccess: (res, tenantKey) => {
      const membership = data?.find((m) => m.tenantKey === tenantKey);
      setTokens(res.accessToken, res.refreshToken, res.tenantKey, membership?.isPersonal ?? false);
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

  const records = useMemo(() => {
    const rows = data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((m) => {
      return (
        m.tenantName.toLowerCase().includes(q) ||
        m.tenantKey.toLowerCase().includes(q) ||
        (m.authorities || []).some((a) => a.toLowerCase().includes(q))
      );
    });
  }, [data, search]);

  return (
    <Container size="xl" py={0}>
      <Helmet title={pageTitle(t`Organizations`)} />
      <PageHeader
        title={<Trans>Organizations</Trans>}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Account Settings</Trans> },
          { label: <Trans>Organizations</Trans> },
        ]}
      />

      <Paper withBorder radius="md" p="md">
        <Group justify="space-between" mb="sm">
          <TextInput
            placeholder={t`Search organizations…`}
            leftSection={<IconSearch size={14} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ width: 320 }}
          />

          <Tooltip label={t`Refresh`} withArrow>
            <ActionIcon
              variant="subtle"
              color="gray"
              onClick={() => void refetch()}
              loading={isFetching}
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
                        exchangeMutation.mutate(m.tenantKey);
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
    </Container>
  );
}
