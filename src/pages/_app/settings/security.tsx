import { createFileRoute } from "@tanstack/react-router";
import {
  Avatar,
  Container,
  Stack,
  Paper,
  Text,
  Group,
  TextInput,
  PasswordInput,
  Button,
  Divider,
  Box,
  Badge,
  Skeleton,
  Alert,
  List,
  ThemeIcon,
  Switch,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconBrandGithub,
  IconBrandGoogle,
  IconBrandWindows,
  IconCheck,
  IconCircleCheck,
  IconKey,
  IconLink,
  IconShieldHalf,
  IconTrash,
} from "@tabler/icons-react";
import { notifications } from "@mantine/notifications";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { useEffect } from "react";
import { Trans, useLingui } from "@lingui/react/macro";

import { PageTitle } from "@/shared/lib/page-title";
import { iamApi, oauth2Api } from "@/shared/api";
import { PageHeader } from "@/shared/ui";
import { useChangePassword } from "@/features/change-password";
import { TestSelectors } from "@/shared/lib/test-selectors";
import { storePostAuthRedirect } from "@/shared/lib/oauth2-post-auth";
import { useSession } from "@/processes/session";

export const Route = createFileRoute("/_app/settings/security")({
  component: SecuritySettingsPage,
});

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

function SecuritySettingsPage() {
  const { t } = useLingui();
  const queryClient = useQueryClient();
  const { isTenantOwner, tenantKey } = useSession();

  const {
    data: profile,
    isLoading: profileLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => iamApi.getMe(),
  });

  const { data: enabledProviders = [], isLoading: providersLoading } = useQuery({
    queryKey: ["oauth2", "providers"],
    queryFn: () => oauth2Api.listEnabledProviders(),
    staleTime: 5 * 60_000,
  });

  const { data: linkedIdentities = [], isLoading: identitiesLoading } = useQuery({
    queryKey: ["oauth2", "identities"],
    queryFn: () => oauth2Api.listLinkedIdentities(),
  });

  const linkedProviders = new Set(linkedIdentities.map((i) => i.provider));

  const linkMutation = useMutation({
    mutationFn: (provider: string) => oauth2Api.getLinkAuthorizationUrl(provider),
    onSuccess: (url) => {
      storePostAuthRedirect("/_app/settings/security");
      window.location.href = url;
    },
    onError: () => {
      notifications.show({
        title: t`Link failed`,
        message: t`Could not start the linking flow.`,
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: (provider: string) => oauth2Api.unlinkProvider(provider),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["oauth2", "identities"] });
      notifications.show({
        title: t`Account unlinked`,
        message: t`The provider was disconnected.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    },
    onError: () => {
      notifications.show({
        title: t`Unlink failed`,
        message: t`Could not unlink this provider.`,
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    },
  });

  const { data: tenantSso, isLoading: tenantSsoLoading } = useQuery({
    queryKey: ["tenant-sso"],
    queryFn: () => iamApi.getTenantSsoConfig(),
    enabled: isTenantOwner,
  });

  const form = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validate: {
      currentPassword: (v) => (v.length < 1 ? t`Current password is required` : null),
      newPassword: (v) => {
        if (v.length < 8) return t`Password must be at least 8 characters`;
        if (v.length > 128) return t`Password must be at most 128 characters`;
        if (!PASSWORD_PATTERN.test(v))
          return t`Password must contain uppercase, lowercase, digit, and special character`;
        return null;
      },
      confirmPassword: (v, values) => (v !== values.newPassword ? t`Passwords do not match` : null),
    },
  });

  const ssoForm = useForm({
    initialValues: {
      displayName: "",
      issuerUri: "",
      clientId: "",
      clientSecret: "",
      scopes: "openid profile email",
      enabled: true,
    },
    validate: {
      displayName: (v) => (v.trim().length < 1 ? t`Display name is required` : null),
      issuerUri: (v) => (v.trim().length < 1 ? t`Issuer URI is required` : null),
      clientId: (v) => (v.trim().length < 1 ? t`Client ID is required` : null),
    },
  });

  useEffect(() => {
    if (!tenantSso) {
      ssoForm.setValues({
        displayName: "",
        issuerUri: "",
        clientId: "",
        clientSecret: "",
        scopes: "openid profile email",
        enabled: true,
      });
      ssoForm.resetDirty();
      return;
    }

    ssoForm.setValues({
      displayName: tenantSso.displayName ?? "",
      issuerUri: tenantSso.issuerUri ?? "",
      clientId: tenantSso.clientId ?? "",
      clientSecret: "",
      scopes: tenantSso.scopes ?? "openid profile email",
      enabled: Boolean(tenantSso.enabled),
    });
    ssoForm.resetDirty();
  }, [tenantSso]);

  const saveSsoMutation = useMutation({
    mutationFn: async (values: typeof ssoForm.values) => {
      await iamApi.updateTenantSsoConfig({
        displayName: values.displayName,
        issuerUri: values.issuerUri,
        clientId: values.clientId,
        clientSecret: values.clientSecret || undefined,
        scopes: values.scopes,
        enabled: values.enabled,
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenant-sso"] });
      ssoForm.setFieldValue("clientSecret", "");
      ssoForm.resetDirty();
      notifications.show({
        title: t`Saved`,
        message: t`SSO configuration updated.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    },
    onError: () => {
      notifications.show({
        title: t`Save failed`,
        message: t`Could not update SSO configuration.`,
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    },
  });

  const deleteSsoMutation = useMutation({
    mutationFn: () => iamApi.deleteTenantSsoConfig(),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["tenant-sso"] });
      notifications.show({
        title: t`Deleted`,
        message: t`SSO configuration removed.`,
        color: "green",
        icon: <IconCheck size={16} />,
      });
    },
    onError: () => {
      notifications.show({
        title: t`Delete failed`,
        message: t`Could not delete SSO configuration.`,
        color: "red",
        icon: <IconAlertCircle size={16} />,
      });
    },
  });

  const mutation = useChangePassword({
    onSuccess: () => {
      form.reset();
    },
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate({
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
    });
  });

  if (isError) {
    return (
      <Container size="md">
        <PageHeader title={t`Security Settings`} />
        <Alert
          icon={<IconAlertCircle size={16} />}
          title={t`Failed to load profile`}
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
    <Container size="md" data-testid={TestSelectors.SECURITY_SETTINGS_PAGE}>
      <PageTitle segments={[t`Security Settings`]} />
      <PageHeader
        title={t`Security Settings`}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Account Settings</Trans> },
          { label: <Trans>Security</Trans> },
        ]}
      />

      <Stack gap="xl">
        <Paper withBorder radius="md" style={{ overflow: "hidden" }}>
          <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <IconLink size={15} color="var(--mantine-color-gray-6)" />
            <Text fw={600} size="sm">
              <Trans>Connected Accounts</Trans>
            </Text>
            {!providersLoading && (
              <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
                {enabledProviders.length}
              </Badge>
            )}
          </Group>

          {providersLoading ? (
            <Stack gap={0}>
              {Array.from({ length: 2 }).map((_, i) => (
                <Box
                  key={i}
                  px="md"
                  py="sm"
                  style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                >
                  <Skeleton height={12} width="35%" radius="sm" />
                </Box>
              ))}
            </Stack>
          ) : enabledProviders.length === 0 ? (
            <Text size="sm" c="dimmed" px="md" py="lg" ta="center">
              <Trans>No external sign-in providers are enabled.</Trans>
            </Text>
          ) : (
            <Stack gap={0}>
              {enabledProviders.map((provider) => {
                const isLinked = linkedProviders.has(provider);
                const icon =
                  provider === "google" ? (
                    <IconBrandGoogle size={16} />
                  ) : provider === "github" ? (
                    <IconBrandGithub size={16} />
                  ) : provider === "microsoft" ? (
                    <IconBrandWindows size={16} />
                  ) : (
                    <IconLink size={16} />
                  );

                const label =
                  provider === "google"
                    ? t`Google`
                    : provider === "github"
                      ? t`GitHub`
                      : provider === "microsoft"
                        ? t`Microsoft`
                        : provider;

                const identity = linkedIdentities.find((i) => i.provider === provider) ?? null;

                return (
                  <Box
                    key={provider}
                    px="md"
                    py="sm"
                    style={{ borderBottom: "1px solid var(--mantine-color-gray-1)" }}
                    data-testid={`security-settings-oauth2-${provider}`}
                  >
                    <Group justify="space-between" wrap="nowrap" align="center">
                      <Group gap="sm" wrap="nowrap">
                        {identity?.avatarUrl ? (
                          <Avatar src={identity.avatarUrl} radius="xl" size={32} />
                        ) : (
                          <Box
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: "50%",
                              background: "var(--mantine-color-gray-1)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            {icon}
                          </Box>
                        )}

                        <Stack gap={0}>
                          <Text size="sm" fw={500}>
                            {label}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {identity?.email ||
                              identity?.displayName ||
                              (isLinked ? t`Connected` : t`Not connected`)}
                          </Text>
                        </Stack>
                      </Group>

                      <Group gap="xs" wrap="nowrap">
                        {identitiesLoading ? (
                          <Skeleton height={30} width={90} radius="sm" />
                        ) : isLinked ? (
                          <Button
                            variant="subtle"
                            color="red"
                            leftSection={<IconTrash size={16} />}
                            loading={unlinkMutation.isPending}
                            onClick={() => unlinkMutation.mutate(provider)}
                            data-testid={`security-settings-oauth2-unlink-${provider}`}
                          >
                            <Trans>Disconnect</Trans>
                          </Button>
                        ) : (
                          <Button
                            variant="light"
                            leftSection={<IconLink size={16} />}
                            loading={linkMutation.isPending}
                            onClick={() => linkMutation.mutate(provider)}
                            data-testid={`security-settings-oauth2-link-${provider}`}
                          >
                            <Trans>Connect</Trans>
                          </Button>
                        )}
                      </Group>
                    </Group>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Paper>

        {isTenantOwner && (
          <Paper withBorder p="xl" radius="md" data-testid="tenant-sso-settings">
            <Group gap="md" mb="xl">
              <IconShieldHalf size={20} color="var(--mantine-color-blue-6)" />
              <Text fw={600}>
                <Trans>Tenant SSO</Trans>
              </Text>
            </Group>

            <form onSubmit={ssoForm.onSubmit((v) => saveSsoMutation.mutate(v))}>
              <Stack gap="md">
                <Text size="sm" c="dimmed">
                  <Trans>
                    Configure a custom OIDC provider for your tenant. The client secret is
                    write-only and will not be shown after saving.
                  </Trans>
                </Text>

                <TextInput
                  label={t`Provider key`}
                  value={tenantSso?.providerKey ?? (tenantKey ? `oidc:${tenantKey}` : "")}
                  readOnly
                />

                <TextInput
                  label={t`Display name`}
                  placeholder={t`Example: Contoso SSO`}
                  disabled={tenantSsoLoading}
                  {...ssoForm.getInputProps("displayName")}
                />

                <TextInput
                  label={t`Issuer URI`}
                  placeholder={t`https://issuer.example.com`}
                  disabled={tenantSsoLoading}
                  {...ssoForm.getInputProps("issuerUri")}
                />

                <TextInput
                  label={t`Client ID`}
                  placeholder={t`Client ID`}
                  disabled={tenantSsoLoading}
                  {...ssoForm.getInputProps("clientId")}
                />

                <PasswordInput
                  label={t`Client secret`}
                  placeholder={tenantSso?.hasClientSecret ? t`••••••••` : t`Client secret`}
                  disabled={tenantSsoLoading}
                  {...ssoForm.getInputProps("clientSecret")}
                />

                <TextInput
                  label={t`Scopes`}
                  placeholder={t`openid profile email`}
                  disabled={tenantSsoLoading}
                  {...ssoForm.getInputProps("scopes")}
                />

                <Switch
                  label={t`Enabled`}
                  checked={ssoForm.values.enabled}
                  onChange={(e) => ssoForm.setFieldValue("enabled", e.currentTarget.checked)}
                  disabled={tenantSsoLoading}
                />

                <Group justify="flex-end">
                  {tenantSso && (
                    <Button
                      variant="subtle"
                      color="red"
                      onClick={() => deleteSsoMutation.mutate()}
                      loading={deleteSsoMutation.isPending}
                      leftSection={<IconTrash size={16} />}
                    >
                      <Trans>Delete</Trans>
                    </Button>
                  )}
                  <Button type="submit" loading={saveSsoMutation.isPending}>
                    <Trans>Save</Trans>
                  </Button>
                </Group>
              </Stack>
            </form>
          </Paper>
        )}

        {/* Roles Card */}
        <Paper
          withBorder
          radius="md"
          style={{ overflow: "hidden" }}
          data-testid={TestSelectors.SECURITY_SETTINGS_ROLES_SECTION}
        >
          <Group px="md" py="sm" style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}>
            <IconShieldHalf size={15} color="var(--mantine-color-gray-6)" />
            <Text fw={600} size="sm">
              <Trans>Roles</Trans>
            </Text>
            {!profileLoading && (
              <Badge variant="light" color="gray" size="sm" radius="sm" ml="auto">
                {profile?.membershipAuthorities?.length ?? 0}
              </Badge>
            )}
          </Group>

          {profileLoading ? (
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
                  data-testid={TestSelectors.SECURITY_SETTINGS_ROLE_ITEM(authority)}
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

        {/* Password Card */}
        <Paper
          withBorder
          p="xl"
          radius="md"
          data-testid={TestSelectors.SECURITY_SETTINGS_PASSWORD_SECTION}
        >
          <Group gap="md" mb="xl">
            <IconKey size={20} color="var(--mantine-color-orange-6)" />
            <Text fw={600}>
              <Trans>Change Password</Trans>
            </Text>
          </Group>

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <PasswordInput
                label={t`Current password`}
                placeholder={t`Enter your current password`}
                data-testid={TestSelectors.SECURITY_SETTINGS_CURRENT_PASSWORD_INPUT}
                {...form.getInputProps("currentPassword")}
              />

              <PasswordInput
                label={t`New password`}
                placeholder={t`Enter new password`}
                data-testid={TestSelectors.SECURITY_SETTINGS_NEW_PASSWORD_INPUT}
                {...form.getInputProps("newPassword")}
              />

              <PasswordInput
                label={t`Confirm new password`}
                placeholder={t`Repeat new password`}
                data-testid={TestSelectors.SECURITY_SETTINGS_CONFIRM_PASSWORD_INPUT}
                {...form.getInputProps("confirmPassword")}
              />

              <Stack gap={4}>
                <Text size="xs" c="dimmed" fw={500}>
                  <Trans>Password requirements:</Trans>
                </Text>
                <List
                  size="xs"
                  c="dimmed"
                  spacing={2}
                  icon={
                    <ThemeIcon size={12} radius="xl" color="gray" variant="transparent">
                      <IconCircleCheck size={12} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    <Trans>At least 8 characters, at most 128</Trans>
                  </List.Item>
                  <List.Item>
                    <Trans>Uppercase and lowercase letters</Trans>
                  </List.Item>
                  <List.Item>
                    <Trans>At least one digit</Trans>
                  </List.Item>
                  <List.Item>
                    <Trans>At least one special character</Trans>
                  </List.Item>
                </List>
              </Stack>

              <Divider />

              <Group justify="flex-end">
                <Button
                  type="submit"
                  color="orange"
                  loading={mutation.isPending}
                  data-testid={TestSelectors.SECURITY_SETTINGS_CHANGE_PASSWORD_BUTTON}
                >
                  <Trans>Change password</Trans>
                </Button>
              </Group>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}
