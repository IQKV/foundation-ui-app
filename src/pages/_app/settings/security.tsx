import { createFileRoute } from "@tanstack/react-router";
import {
  Container,
  Stack,
  Paper,
  Text,
  Group,
  PasswordInput,
  Button,
  Divider,
  Box,
  Badge,
  Skeleton,
  Alert,
  List,
  ThemeIcon,
} from "@mantine/core";
import { IconShieldHalf, IconKey, IconAlertCircle, IconCircleCheck } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import { Helmet } from "@dr.pogodin/react-helmet";
import { pageTitle } from "@/shared/lib/page-title";
import { iamApi } from "@/shared/api";
import { PageHeader } from "@/shared/ui";
import { useChangePassword } from "@/features/change-password";
import { TestSelectors } from "@/shared/lib/test-selectors";

export const Route = createFileRoute("/_app/settings/security")({
  component: SecuritySettingsPage,
});

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z0-9]).+$/;

function SecuritySettingsPage() {
  const { t } = useLingui();

  const {
    data: profile,
    isLoading: profileLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["me"],
    queryFn: () => iamApi.getMe(),
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
      <Helmet title={pageTitle(t`Security Settings`)} />
      <PageHeader
        title={t`Security Settings`}
        breadcrumbs={[
          { label: <Trans>Home</Trans>, to: "/" },
          { label: <Trans>Account Settings</Trans> },
          { label: <Trans>Security</Trans> },
        ]}
      />

      <Stack gap="xl">
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
